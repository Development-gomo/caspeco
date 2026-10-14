// src/app/sitemap.js
// Dynamically generated sitemap from WordPress content.
// Revalidates every 60s (same as page ISR) so new WP content appears quickly.

import { fetchWP } from "@/lib/api";
import { SUPPORTED_LANGS, DEFAULT_LANG, ROUTE_TYPES } from "@/config";

export const revalidate = 60;

const SITE_URL = process.env.SITE_URL;

function url(lang, path) {
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return `${SITE_URL}${prefix}${path}`;
}

// Localized base for a ROUTE_TYPES entry, e.g. based("post") → (slug, "en") → "/articles/slug"
const based = (type) => (s, lang) => `/${ROUTE_TYPES[type].base[lang]}/${s}`;

const CONTENT_TYPES = [
  { endpoint: "/wp/v2/pages",            path: (s) => `/${s}`,          priority: 0.8, changeFrequency: "monthly", skip: new Set(["frontpage"]) },
  { endpoint: "/wp/v2/solutions",        path: (s) => `/service/${s}`,  priority: 0.8, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/products",         path: based("product"),        priority: 0.8, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/industries",       path: based("industry"),       priority: 0.7, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/partner",          path: based("partner"),        priority: 0.5, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/casestudies",      path: based("casestudy"),      priority: 0.7, changeFrequency: "monthly" },
  { endpoint: "/wp/v2/posts",            path: based("post"),           priority: 0.6, changeFrequency: "weekly"  },
  { endpoint: "/wp/v2/partner_category", path: based("partnerCategory"), priority: 0.5, changeFrequency: "monthly", term: true },
];

export default async function sitemap() {
  const entries = [];

  // Homepages — one per language
  for (const lang of SUPPORTED_LANGS) {
    entries.push({
      url: lang === DEFAULT_LANG ? `${SITE_URL}/` : `${SITE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    });
  }

  // Content types — fetch all languages in parallel per type
  for (const type of CONTENT_TYPES) {
    const results = await Promise.all(
      SUPPORTED_LANGS.map((lang) =>
        fetchWP(`${type.endpoint}?per_page=100&lang=${lang}`)
      )
    );

    for (let i = 0; i < SUPPORTED_LANGS.length; i++) {
      const lang = SUPPORTED_LANGS[i];
      const items = Array.isArray(results[i]) ? results[i] : [];
      for (const item of items) {
        if (type.skip?.has(item.slug)) continue;
        // child pages live under their parent's path; skip them rather than list a wrong URL
        if (type.endpoint === "/wp/v2/pages" && item.parent) continue;
        // empty partner categories have no page worth indexing
        if (type.term && !item.count) continue;
        // Exclude pages explicitly set to noindex in Yoast Advanced Settings.
        // Checks raw per-page meta (not aggregated robots which includes global WP noindex).
        if (item.meta?.noindex === "1") continue; // Yoast noindex meta, renamed in lib/wpMask.js
        entries.push({
          url: url(lang, type.path(item.slug, lang)),
          lastModified: new Date(item.modified || item.date || Date.now()),
          changeFrequency: type.changeFrequency,
          priority: type.priority,
        });
      }
    }
  }

  return entries;
}
