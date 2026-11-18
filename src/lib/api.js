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

const _fetchWP = cache(async function _fetchWP(url, revalidate) {
  try {
    const res = await fetch(url, { next: { revalidate: revalidateFor(revalidate) } });
    return maskWp(await res.json());
  } catch {
    return null;
  }
});

// Generic fetch helper with ISR revalidation (60s by default).
export function fetchWP(endpoint, { revalidate = 60 } = {}) {
  const url = `${WP_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  return _fetchWP(url, revalidate);
}

// Pages
async function getSingleEntry(endpoint, slug, lang = DEFAULT_LANG, query = "") {
  if (!slug) return null;

  try {
    const url = `/wp/v2/${endpoint}?slug=${encodeURIComponent(slug)}&lang=${lang}${query}`;
    const entries = await fetchWP(url);

    if (!Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    return (
      entries.find((entry) => entry.lang === lang) ||
      entries.find((entry) => entry.slug === slug) ||
      entries[0]
    );
  } catch (err) {
    return null;
  }
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
export async function getPageByPath(segments, lang = DEFAULT_LANG) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  const candidates = await fetchWP(
    `/wp/v2/pages?slug=${encodeURIComponent(segments.at(-1))}&lang=${lang}`
  );
  if (!Array.isArray(candidates)) return null;

  for (const page of candidates) {
    let parentId = page.parent;
    let ok = true;
    for (let i = segments.length - 2; i >= 0; i--) {
      const parent = parentId ? await fetchWP(`/wp/v2/pages/${parentId}?lang=${lang}&_fields=id,slug,parent`) : null;
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
  return Array.isArray(terms) && terms.length ? terms[0] : null;
}

export async function getPartnersByCategory(termId, lang = DEFAULT_LANG) {
  if (!termId) return [];
  const partners = await fetchWP(
    `/wp/v2/partner?partner_category=${termId}&lang=${lang}&per_page=100&orderby=title&order=asc&_embed=wp:featuredmedia`
  );
  return Array.isArray(partners) ? partners : [];
}

// Other partners (logo + name cards under a partner page), the current one excluded
export async function getOtherPartners(excludeId, lang = DEFAULT_LANG, limit = 3) {
  const partners = await fetchWP(
    `/wp/v2/partner?lang=${lang}&per_page=${limit + 1}&orderby=title&order=asc&_embed=wp:featuredmedia`
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

export async function getPostBySlug(slug, lang = DEFAULT_LANG) {
  const post = await getSingleEntry("posts", slug, lang);

  if (post) {
    // Up to 3 related posts for PostCard: same category first, topped up with the latest.
    // Same fields/embeds as the news listing (image, category, content for read time).
    const RELATED = 3;
    const cardFields = "&_embed=wp:featuredmedia,wp:term&_fields=id,slug,date,title,content,_links,_embedded";
    const categoryIds = Array.isArray(post.categories) && post.categories.length > 0 ? post.categories.join(",") : null;
    const sameCategory = categoryIds
      ? await fetchWP(`/wp/v2/posts?exclude=${post.id}&per_page=${RELATED}&lang=${lang}&categories=${categoryIds}${cardFields}`)
      : [];
    let related = Array.isArray(sameCategory) ? sameCategory : [];
    if (related.length < RELATED) {
      const exclude = [post.id, ...related.map((p) => p.id)].join(",");
      const latest = await fetchWP(`/wp/v2/posts?exclude=${exclude}&per_page=${RELATED - related.length}&lang=${lang}${cardFields}`);
      if (Array.isArray(latest)) related = [...related, ...latest];
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

export async function getCaseStudies(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/casestudies?lang=${lang}&per_page=100&_embed`);
}

export async function getAllPosts(lang) {
  return fetchWP(`/wp/v2/posts?lang=${lang}&per_page=10&_embed`);
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
  const posts = await fetchWP(`/wp/v2/posts?include=${ids.join(",")}&orderby=include&per_page=${ids.length}&_embed&lang=${lang}`);
  return Array.isArray(posts) ? posts : [];
}

export async function getProductsByIds(ids, lang = DEFAULT_LANG) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const products = await fetchWP(`/wp/v2/products?include=${ids.join(",")}&orderby=include&per_page=${ids.length}&_embed&lang=${lang}`);
  return Array.isArray(products) ? products : [];
}

export async function getAllProducts(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/products?lang=${lang}&per_page=100&_embed`);
}

export async function getAllIndustries(lang = DEFAULT_LANG) {
  return await fetchWP(`/wp/v2/industries?lang=${lang}&per_page=100&_embed`);
}

// Get translations for any entry type - try custom endpoint first, then fallback
export async function getEntryTranslations(entryId, entryType = "pages", lang = DEFAULT_LANG) {
  // Try custom endpoint first (works for all post types if WordPress endpoint supports it)
  const customTranslations = await fetchWP(`/myroutes/v1/translations/${entryId}?lang=${lang}`);
  if (customTranslations && Object.keys(customTranslations).length > 0) {
    return customTranslations;
  }

  // Fallback: get the entry and extract translations
  const entry = await fetchWP(`/wp/v2/${entryType}/${entryId}`);
  return entry?.translations || entry?.wpml_translations || entry?.icl_translations || null;
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
  if (!res.ok) throw json;
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

  if (json?.status && json.status !== "mail_sent") {
    throw {
      ...json,
      message: json?.message || "CF7 validation failed",
      cf7: json,
    };
  }

  return json;
}
