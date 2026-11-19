// src/app/sitemap.js
// Dynamically generated sitemap from WordPress content.
// Revalidates every 60s (same as page ISR) so new WP content appears quickly.
// A failed WordPress request THROWS, so ISR keeps serving the previous sitemap instead of a partial one.

import { fetchWPPaged, isWpError } from "@/lib/api";
import { SUPPORTED_LANGS, DEFAULT_LANG, ROUTE_TYPES, siteUrl, sitePath } from "@/config";

export const revalidate = 60;

// Languages listed in the sitemap. The single place to narrow to the launch languages later.
const SITEMAP_LANGS = SUPPORTED_LANGS;

function url(lang, path) {
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return `${siteUrl()}${sitePath(`${prefix}${path}`)}`;
}

// Localized base for a ROUTE_TYPES entry, e.g. based("post") → (slug, "en") → "/articles/slug"
const based = (type) => (s, lang) => `/${ROUTE_TYPES[type].base[lang]}/${s}`;

const CONTENT_TYPES = [
  { endpoint: "/wp/v2/pages",            path: (s) => `/${s}`,          priority: 0.8, changeFrequency: "monthly", skip: new Set(["frontpage"]) },
  { endpoint: "/wp/v2/products",         path: based("product"),        priority: 0.8, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/industries",       path: based("industry"),       priority: 0.7, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/icp",              path: based("icp"),            priority: 0.7, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/partner",          path: based("partner"),        priority: 0.5, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/casestudies",      path: based("casestudy"),      priority: 0.7, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/posts",            path: based("post"),           priority: 0.6, changeFrequency: "weekly"  },
  { endpoint: "/wp/v2/partner_category", path: based("partnerCategory"), priority: 0.5, changeFrequency: "monthly", term: true },
];

const ITEM_FIELDS = "id,slug,parent,modified_gmt";
const TERM_FIELDS = "id,slug,count";

// All items of an endpoint for one language, following WP paging (100 per page).
// Throws when a request fails (null after retries) or the answer is not a list.
async function fetchAll(endpoint, lang, fields) {
  const items = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    if (page > 20) throw new Error(`[sitemap] too many pages: ${endpoint} ${lang}`);
    const r = await fetchWPPaged(`${endpoint}?per_page=100&page=${page}&lang=${lang}&_fields=${fields}`);
    if (!r) throw new Error(`[sitemap] WordPress request failed: ${endpoint} ${lang} p${page}`); // ISR keeps the previous sitemap
    if (page === 1 && isWpError(r.data) && r.data.data?.status === 404) return []; // type not registered
    if (!Array.isArray(r.data)) throw new Error(`[sitemap] bad response: ${endpoint} ${lang}`);
    items.push(...r.data);
    pages = r.totalPages || 1;
  }
  return items;
}

// Path of a page including its parent chain ("/parent/child"); null when a parent is missing or the chain loops
function pagePath(item, byId) {
  const slugs = [];
  const seen = new Set();
  let cur = item;
  while (cur) {
    if (seen.has(cur.id)) return null; // cycle
    seen.add(cur.id);
    slugs.unshift(cur.slug);
    if (!cur.parent) return `/${slugs.join("/")}`;
    cur = byId.get(cur.parent);
  }
  return null; // missing parent
}

const modified = (item) => (item.modified_gmt ? new Date(`${item.modified_gmt}Z`) : undefined);

export default async function sitemap() {
  // Fetch every language in parallel, one content type at a time
  const data = [];
  for (const type of CONTENT_TYPES) {
    const fields = type.term ? TERM_FIELDS : ITEM_FIELDS;
    data.push(await Promise.all(SITEMAP_LANGS.map((lang) => fetchAll(type.endpoint, lang, fields))));
  }

  const entries = [];

  // Homepages — one per language, dated by that language's frontpage (no date when it has none)
  const pagesIdx = CONTENT_TYPES.findIndex((t) => t.endpoint === "/wp/v2/pages");
  SITEMAP_LANGS.forEach((lang, i) => {
    const front = data[pagesIdx][i].find((p) => p.slug === "frontpage");
    const lastModified = front ? modified(front) : undefined;
    entries.push({
      url: lang === DEFAULT_LANG ? `${siteUrl()}/` : `${siteUrl()}/${lang}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 1.0,
    });
  });

  CONTENT_TYPES.forEach((type, t) => {
    SITEMAP_LANGS.forEach((lang, i) => {
      const items = data[t][i];
      const byId = type.endpoint === "/wp/v2/pages" ? new Map(items.map((p) => [p.id, p])) : null;
      for (const item of items) {
        if (type.skip?.has(item.slug)) continue;
        // empty partner categories have no page worth indexing
        if (type.term && !item.count) continue;
        let path = null;
        if (byId) {
          path = pagePath(item, byId); // child pages live under their parent's path
          if (!path) continue;
        } else {
          path = type.path(item.slug, lang);
        }
        const lastModified = type.term ? undefined : modified(item);
        entries.push({
          url: url(lang, path),
          ...(lastModified ? { lastModified } : {}),
          changeFrequency: type.changeFrequency,
          priority: type.priority,
        });
      }
    });
  });

  return entries;
}
