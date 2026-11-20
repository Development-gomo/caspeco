import { DEFAULT_LANG } from "@/config";
import { WP_BASE } from "@/config";
import { cache } from "react";
import { maskWp } from "@/lib/wpMask";
import { POSTS_PER_PAGE, postsPageQuery } from "@/lib/postsQuery";

// Deduped fetch: React.cache ensures identical calls within the same
// server render are only executed once (works across page + generateMetadata).
// Responses are masked so no CMS URL reaches the browser (see lib/wpMask.js).
// Staging/dev: set WP_REVALIDATE_SECONDS=0 in the Vercel env to bypass the ISR cache for every WP fetch,
// so content and deploys show up immediately without the client clearing their cache. Leave it unset in production.
const REVALIDATE_OVERRIDE = process.env.WP_REVALIDATE_SECONDS;
const revalidateFor = (seconds) => {
  const n = REVALIDATE_OVERRIDE === undefined || REVALIDATE_OVERRIDE === "" ? NaN : Number(REVALIDATE_OVERRIDE);
  return Number.isFinite(n) && n >= 0 ? n : seconds;
};

// The CMS host sometimes answers a server-side request with a 5xx / 429 / a bot-check HTML page instead of JSON.
// That used to become null -> "page not found" and the 404 was then cached by ISR ("refresh twice" to get the page).
// Now a failed attempt is retried (fresh, uncached) and only a still-failing request returns null.
// null always means "the request failed"; a real "not found" is an empty list / WP error object.
const RETRIES = 2;
const _fetchWP = cache(async function _fetchWP(url, revalidate) {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, attempt === 0 ? { next: { revalidate: revalidateFor(revalidate) } } : { cache: "no-store" });
      // other 4xx (e.g. rest_no_route) are final answers; 408 / 429 and 5xx are worth retrying
      const final = res.ok || (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429);
      if (final) return maskWp(await res.json()); // an HTML body throws here and is retried
    } catch {
      // network error or non-JSON body: retry
    }
    if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
  }
  return null;
});

// Generic fetch helper with ISR revalidation (60s by default).
export function fetchWP(endpoint, { revalidate = 60 } = {}) {
  const url = `${WP_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  return _fetchWP(url, revalidate);
}

// Pages
async function getSingleEntry(endpoint, slug, lang = DEFAULT_LANG, query = "") {
  if (!slug) return null;

  const url = `/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&lang=${lang}${query}`;
  const entries = await fetchWP(url);

  // the request itself failed (after retries): error out (500, never cached) instead of a cached false 404
  if (entries === null) throw new Error(`WordPress request failed: ${endpoint} / ${slug}`);

  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  return (
    entries.find((entry) => entry.lang === lang) ||
    entries.find((entry) => entry.slug === slug) ||
    entries[0]
  );
}

export async function getPageBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("pages", slug, lang);
}

// acf_format=standard: the "Page Builder Case study" group otherwise returns images as IDs
export async function getCaseStudyBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("casestudies", slug, lang, "&acf_format=standard");
}

// acf_format=standard: the "Page Builder Products" group otherwise returns images as
// bare media IDs (ACF REST "light" format); standard gives full image objects with url
export async function getProductBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("products", slug, lang, "&acf_format=standard");
}

// acf_format=standard for the "Page Builder Industries" group (image objects, not IDs)
export async function getIndustryBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("industries", slug, lang, "&acf_format=standard");
}

// ICP pages (CPT "icp", field group "Page Builder ICP Page"); acf_format=standard → image objects
export async function getIcpBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("icp", slug, lang, "&acf_format=standard");
}

// All ICP pages of a language (for the "related_icp" cards): title, excerpt, featured image
export async function getAllIcps(lang = DEFAULT_LANG) {
  const list = await fetchWP(`/wp/v2/icp?lang=${lang}&per_page=50&_embed=wp:featuredmedia&_fields=id,slug,title,excerpt,acf,_links,_embedded`);
  return Array.isArray(list) ? list : [];
}

// Team members (CPT "kontakt") by ID, with their featured image — used by the ICP team
// and contact sections (ACF post objects don't include the photo).
// WPML filters by language, so the entry's lang is required (ids are language-specific)
export async function getKontaktByIds(ids, lang = DEFAULT_LANG) {
  const list = (ids || []).filter(Boolean);
  if (!list.length) return [];
  const res = await fetchWP(`/wp/v2/kontakt?include=${list.join(",")}&lang=${lang}&per_page=${list.length}&_embed=wp:featuredmedia&acf_format=standard`);
  return Array.isArray(res) ? res : [];
}

export async function getPartnerBySlug(slug, lang = DEFAULT_LANG) {
  return getSingleEntry("partner", slug, lang, "&_embed=wp:featuredmedia");
}

// Child page by its full path (["articles", "blackbox-sce-2-0"]): the last segment is
// the page slug, and its parent chain must match the earlier segments.
// The candidates and every page carrying one of the parent slugs are fetched in parallel (one round
// trip instead of one request per parent level); the parent chain is then checked in memory.
export async function getPageByPath(segments, lang = DEFAULT_LANG) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  const parentSlugs = [...new Set(segments.slice(0, -1))];
  const [candidates, ancestors] = await Promise.all([
    fetchWP(`/wp/v2/pages?slug=${encodeURIComponent(segments.at(-1))}&lang=${lang}`),
    parentSlugs.length
      ? fetchWP(`/wp/v2/pages?slug=${parentSlugs.map(encodeURIComponent).join(",")}&lang=${lang}&per_page=100&_fields=id,slug,parent`)
      : [],
  ]);
  if (candidates === null) throw new Error(`WordPress request failed: pages / ${segments.join("/")}`);
  if (!Array.isArray(candidates)) return null;
  const byId = new Map((Array.isArray(ancestors) ? ancestors : []).map((p) => [p.id, p]));

  for (const page of candidates) {
    let parentId = page.parent;
    let ok = true;
    for (let i = segments.length - 2; i >= 0; i--) {
      if (parentId && ancestors === null) throw new Error(`WordPress request failed: pages / ${segments.slice(0, -1).join("/")}`);
      const parent = parentId ? byId.get(parentId) : null;
      if (!parent || parent.slug !== segments[i]) {
        ok = false;
        break;
      }
      parentId = parent.parent;
    }
    // the chain must end at a top-level page, so /a/b/c can't match a page at /x/a/b/c
    if (ok && !parentId) return page;
  }
  return null;
}

// Partner category (taxonomy "partner_category") and the partners in it
export async function getPartnerCategoryBySlug(slug, lang = DEFAULT_LANG) {
  if (!slug) return null;
  const terms = await fetchWP(`/wp/v2/partner_category?slug=${encodeURIComponent(slug)}&lang=${lang}`);
  if (terms === null) throw new Error(`WordPress request failed: partner_category / ${slug}`);
  return Array.isArray(terms) && terms.length ? terms[0] : null;
}

// Partner cards (PartnerCategoryTemplate, PartnerTemplate) read only id, slug, title and the logo
// (_links is needed for _embedded to be returned)
const PARTNER_CARD_FIELDS = "id,slug,title,_links,_embedded";

export async function getPartnersByCategory(termId, lang = DEFAULT_LANG) {
  if (!termId) return [];
  const partners = await fetchWP(
    `/wp/v2/partner?partner_category=${termId}&lang=${lang}&per_page=100&orderby=title&order=asc&_embed=wp:featuredmedia&_fields=${PARTNER_CARD_FIELDS}`
  );
  return Array.isArray(partners) ? partners : [];
}

// Other partners (logo + name cards under a partner page), the current one excluded
export async function getOtherPartners(excludeId, lang = DEFAULT_LANG, limit = 3) {
  const partners = await fetchWP(
    `/wp/v2/partner?lang=${lang}&per_page=${limit + 1}&orderby=title&order=asc&_embed=wp:featuredmedia&_fields=${PARTNER_CARD_FIELDS}`
  );
  return Array.isArray(partners) ? partners.filter((p) => p.id !== excludeId).slice(0, limit) : [];
}

// All partner categories and all partners (Integrations listing groups the partners by category)
export async function getPartnerCategories(lang = DEFAULT_LANG) {
  const terms = await fetchWP(`/wp/v2/partner_category?per_page=100&lang=${lang}&orderby=name&order=asc&_fields=id,name,slug,count`);
  return Array.isArray(terms) ? terms : [];
}

export async function getAllPartners(lang = DEFAULT_LANG) {
  const partners = await fetchWP(
    `/wp/v2/partner?per_page=100&lang=${lang}&orderby=title&order=asc&_embed=wp:featuredmedia&_fields=id,slug,title,partner_category,featured_media,_links,_embedded`
  );
  return Array.isArray(partners) ? partners : [];
}

// _embed=wp:featuredmedia: the hero image comes with the post (PostTemplate falls back to /media/{id})
export async function getPostBySlug(slug, lang = DEFAULT_LANG) {
  const post = await getSingleEntry("posts", slug, lang, "&_embed=wp:featuredmedia");

  if (post) {
    // moved to post.featuredMedia so the entry keeps its previous shape (lib/seo.js reads _embedded for og:image)
    if (post._embedded) {
      post.featuredMedia = post._embedded["wp:featuredmedia"]?.[0] || null;
      delete post._embedded;
    }

    // Start what PostTemplate / Shell read next (hero category pills, language switcher) now, alongside
    // the related posts; fetchWP's per-request cache hands them the same requests. Neither rejects.
    getCategoriesByIds(post.categories, lang);
    getTranslationMap(post.id, lang);

    // Up to 3 related posts for PostCard: same category first, topped up with the latest.
    // Same fields/embeds as the news listing (image, category, content for read time).
    // Both lists are fetched in parallel: the 3 latest (current post excluded) always contain the
    // top-up, because at most the same-category posts among them are dropped.
    const RELATED = 3;
    const cardFields = "&_embed=wp:featuredmedia,wp:term&_fields=id,slug,date,title,content,_links,_embedded";
    const categoryIds = Array.isArray(post.categories) && post.categories.length > 0 ? post.categories.join(",") : null;
    const [sameCategory, latest] = await Promise.all([
      categoryIds
        ? fetchWP(`/wp/v2/posts?exclude=${post.id}&per_page=${RELATED}&lang=${lang}&categories=${categoryIds}${cardFields}`)
        : [],
      fetchWP(`/wp/v2/posts?exclude=${post.id}&per_page=${RELATED}&lang=${lang}${cardFields}`),
    ]);
    let related = Array.isArray(sameCategory) ? sameCategory : [];
    if (related.length < RELATED && Array.isArray(latest)) {
      const taken = new Set(related.map((p) => p.id));
      related = [...related, ...latest.filter((p) => !taken.has(p.id)).slice(0, RELATED - related.length)];
    }
    post.relatedPosts = related;
  }

  return post;
}

export async function getAllTeam(lang = DEFAULT_LANG) {
  return await fetchWP(
    `/wp/v2/teammembers?per_page=100&_embed&lang=${lang}`
  );
}

export async function getMediaById(id) {
  if (!id) return null;
  try {
    return await fetchWP(`/wp/v2/media/${id}`);
  } catch (err) {
    return null;
  }
}

// Theme options (logo, header menu, footer, logo galleries). A language whose options
// pages aren't translated in WPML returns [] (e.g. nl) — fall back to the default
// language so the header/footer never render empty.
const hasOptions = (o) => o && !Array.isArray(o) && typeof o === "object" && Object.keys(o).length > 0;

export async function getThemeOptions(lang = DEFAULT_LANG) {
  try {
    const options = await fetchWP(`/headless/v1/theme-options?lang=${lang}`, { revalidate: 300 });
    if (hasOptions(options)) return options;
    if (lang !== DEFAULT_LANG) {
      const fallback = await fetchWP(`/headless/v1/theme-options?lang=${DEFAULT_LANG}`, { revalidate: 300 });
      if (hasOptions(fallback)) return fallback;
    }
    return { header: {}, footer: {} };
  } catch {
    return { header: {}, footer: {} };
  }
}

// Partner / integration logo galleries (Theme Settings → Partners Logo / Integrations Logo).
// Managed once for all languages; a language without its own gallery falls back to the default.
export async function getLogoGalleries(lang = DEFAULT_LANG) {
  const pick = (options, key) => (Array.isArray(options?.[key]) ? options[key].filter((logo) => logo?.url) : []);
  const options = await getThemeOptions(lang);
  let partners = pick(options, "partners_logo");
  let integrations = pick(options, "integrations_logo");
  if ((!partners.length || !integrations.length) && lang !== DEFAULT_LANG) {
    const fallback = await getThemeOptions(DEFAULT_LANG);
    if (!partners.length) partners = pick(fallback, "partners_logo");
    if (!integrations.length) integrations = pick(fallback, "integrations_logo");
  }
  return { partners, integrations };
}

// Case cards (CaseCard, RealtedCase, HomeCaseStudies, PageBuilder logo lookup) and generateStaticParams
// read id, slug, date, title, acf and the featured image only
export async function getCaseStudies(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/casestudies?lang=${lang}&per_page=100&_embed=wp:featuredmedia&_fields=id,slug,date,title,acf,_links,_embedded`);
}

// Fields PostCard reads (image, category terms, content for the read time, primary category)
const POST_CARD_QUERY = "&_embed=wp:featuredmedia,wp:term&_fields=id,slug,title,content,primary_category,meta,_links,_embedded";

export async function getAllPosts(lang) {
  return fetchWP(`/wp/v2/posts?lang=${lang}&per_page=10${POST_CARD_QUERY}`);
}

// Case studies for the Business Twin section — newest first, without the post body
export async function getTwinCaseStudies(lang = DEFAULT_LANG) {
  const list = await fetchWP(
    `/wp/v2/casestudies?lang=${lang}&per_page=100&orderby=date&order=desc&_embed=wp:featuredmedia&_fields=id,slug,date,title,acf,_links,_embedded`
  );
  return Array.isArray(list) ? list : [];
}

// Several media items in one request (resolves ACF image/file IDs to URLs)
export async function getMediaByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const media = await fetchWP(`/wp/v2/media?include=${ids.join(",")}&per_page=100&_fields=id,source_url,alt_text`);
  return Array.isArray(media) ? media : [];
}

// Specific posts in the given order (e.g. an ACF relationship field)
// Category names for a post's category IDs (article hero pills)
export async function getCategoriesByIds(ids, lang = DEFAULT_LANG) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const cats = await fetchWP(`/wp/v2/categories?include=${ids.join(",")}&lang=${lang}&_fields=id,name,slug`, { revalidate: 3600 });
  return Array.isArray(cats) ? cats : [];
}

// One page of posts plus WP's totals (X-WP-Total / X-WP-TotalPages) for "Load more"
export async function getPostsPage(lang = DEFAULT_LANG, page = 1, perPage = POSTS_PER_PAGE) {
  try {
    const res = await fetch(`${WP_BASE}${postsPageQuery(lang, page, perPage)}`, { next: { revalidate: revalidateFor(60) } });
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
    const posts = maskWp(await res.json());
    return {
      posts: Array.isArray(posts) ? posts : [],
      total: Number(res.headers.get("x-wp-total")) || 0,
      totalPages: Number(res.headers.get("x-wp-totalpages")) || 0,
    };
  } catch {
    return { posts: [], total: 0, totalPages: 0 };
  }
}

export async function getPostsByIds(ids, lang) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const posts = await fetchWP(`/wp/v2/posts?include=${ids.join(",")}&orderby=include&per_page=${ids.length}${POST_CARD_QUERY}&lang=${lang}`);
  return Array.isArray(posts) ? posts : [];
}

// Product cards (ProductRelated, DynamicProductCards) read id, slug, title, excerpt and the featured image
export async function getProductsByIds(ids, lang = DEFAULT_LANG) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const products = await fetchWP(`/wp/v2/products?include=${ids.join(",")}&orderby=include&per_page=${ids.length}&_embed=wp:featuredmedia&_fields=id,slug,title,excerpt,_links,_embedded&lang=${lang}`);
  return Array.isArray(products) ? products : [];
}

export async function getAllProducts(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/products?lang=${lang}&per_page=100&_embed`);
}

export async function getAllIndustries(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/industries?lang=${lang}&per_page=100&_embed`);
}

// WPML translation map for one entry: { "<lang>": { id, slug, title, lang } } (includes the current lang).
// null = lookup failed / empty, so callers fall back to homepage links instead of hiding languages.
export async function getTranslationMap(entryId, lang = DEFAULT_LANG) {
  if (!entryId) return null;
  // every route is dynamic (headers() in the root layout) → build-time renders are discarded; don't spend WP calls on them
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  const map = await fetchWP(`/myroutes/v1/translations/${entryId}?lang=${lang}`, { revalidate: 300 });
  const ok = map && typeof map === "object" && !Array.isArray(map) && !map.code &&
    Object.values(map).some((t) => typeof t?.slug === "string" && t.slug);
  return ok ? map : null;
}

// Team type

export function extractTeamTypes(member) {
  const types = [];

  // Preferred: embedded taxonomy
  const embedded = member?._embedded?.["wp:term"] || [];
  embedded.flat().forEach((term) => {
    if (term.taxonomy === "teamtype") {
      types.push({
        id: term.id,
        slug: term.slug,
        name: term.name,
      });
    }
  });

  // Fallback: post classes (WP class_list, renamed to "classes" in lib/wpMask.js)
  const classes = member?.classes || member?.class_list;
  if (types.length === 0 && Array.isArray(classes)) {
    classes.forEach((cls) => {
      if (cls.startsWith("teamtype-")) {
        const slug = cls.replace("teamtype-", "");
        types.push({
          slug,
          name: slug.replace(/-/g, " "),
        });
      }
    });
  }

  return types;
}

export function buildTeamFilters(team = []) {
  const map = {};

  team.forEach((member) => {
    extractTeamTypes(member).forEach((type) => {
      map[type.slug] = type;
    });
  });

  return [
    { slug: "all", name: "All" },
    ...Object.values(map),
  ];
}

export function filterTeamByType(team = [], activeType = "all") {
  if (activeType === "all") return team;

  return team.filter((member) =>
    extractTeamTypes(member).some(
      (type) => type.slug === activeType
    )
  );
}
export function getTeamImage(member) {
  return (
    member?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    null
  );
}


// ✅ schema endpoint you already exposed
export async function getCf7FormSchema(formId, lang = DEFAULT_LANG) {
  return await fetchWP(`/headless/v1/cf7-form/${formId}?lang=${lang}`);
}

// ✅ recommended: submit via your proxy endpoint (stable)
export async function submitCf7FormProxy(formId, payload) {
  const res = await fetch(`${WP_BASE}/headless/v1/cf7-submit/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  // Only a confirmed CF7 "mail_sent" (or an explicit success flag from the proxy) counts as sent.
  // A non-JSON body (e.g. a host CAPTCHA page with HTTP 202) or any other CF7 status must surface as an error.
  const status = json?.status ?? json?.cf7?.status;
  const sent = status ? status === "mail_sent" : json?.success === true || json?.ok === true;
  if (!res.ok || !sent) {
    throw {
      ...json,
      message: json?.message || json?.cf7?.message || "Failed to send. Please try again.",
      cf7: json?.cf7 ?? json,
    };
  }
  return json;
}

export async function submitCf7Direct(formId, schemaHidden, values) {
  const fd = new FormData();
  Object.entries({ ...(schemaHidden || {}), ...(values || {}) }).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => fd.append(k, String(vv)));
    else fd.append(k, String(v));
  });

  const res = await fetch(`${WP_BASE}/contact-form-7/v1/contact-forms/${formId}/feedback`, {
    method: "POST",
    body: fd,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw {
      ...json,
      message: json?.message || "CF7 direct submit failed",
      cf7: json,
    };
  }

  // Success only when CF7 confirms "mail_sent". An empty/non-JSON body (e.g. a host CAPTCHA page
  // returned with HTTP 202, which res.ok treats as OK) must not be reported to the visitor as sent.
  if (json?.status !== "mail_sent") {
    throw {
      ...json,
      message: json?.message || "Failed to send. Please try again.",
      cf7: json,
    };
  }

  return json;
}
