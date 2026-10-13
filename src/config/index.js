// src/config/index.js

// Fallback to "sv" so a missing env var on the host can't produce "/undefined" routes
export const DEFAULT_LANG = process.env.NEXT_PUBLIC_DEFAULT_LANG || "sv";
export const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE;

// ─── Add new languages here — everything else updates automatically ───────────
// Codes must match the WPML language codes in WordPress.
export const SUPPORTED_LANGS = ["sv", "en", "no", "fr", "frbg", "nl"];

// Locale map for OG/SEO tags (matches WPML "Default locale")
export const LOCALE_MAP = {
  sv: "sv_SE",
  en: "en_US",
  no: "nb_NO",
  fr: "fr_FR",
  frbg: "fr_BE",
  nl: "nl_NL",
};

// ─── URL bases per content type — copied from the live caspeco.com structure ──
// Keep in sync with the WordPress permalink / WPML slug-translation settings so
// URLs stay identical after the switch (no redirects, no 404s).
// key = internal type, rest = WP REST base, base = per-language path segment.
const allLangs = (segment) => Object.fromEntries(SUPPORTED_LANGS.map((l) => [l, segment]));

export const ROUTE_TYPES = {
  post: {
    rest: "posts",
    base: { sv: "artiklar", en: "articles", no: "artikler", fr: "articles", frbg: "articles", nl: "artikelen" },
  },
  casestudy: { rest: "casestudies", base: allLangs("case") },
  product: { rest: "products", base: { ...allLangs("produkt"), en: "product" } },
  partner: { rest: "partner", base: allLangs("partner") },
  partnerCategory: { rest: "partner_category", taxonomy: true, base: allLangs("partner-category") },
};

/** Localized URL of a single entry, e.g. entryHref("post", "my-slug", "en") → "/en/articles/my-slug" */
export function entryHref(type, slug, lang = DEFAULT_LANG) {
  const base = ROUTE_TYPES[type]?.base[lang] || ROUTE_TYPES[type]?.base[DEFAULT_LANG];
  if (!base || !slug) return langHome(lang);
  return langHref(`/${base}/${slug}`, lang);
}

/** Content type for a URL base in a language ("artiklar", "sv" → "post"), or null */
export function typeFromBase(base, lang = DEFAULT_LANG) {
  return Object.keys(ROUTE_TYPES).find((type) => ROUTE_TYPES[type].base[lang] === base) || null;
}

/** Prefix a local path with the current language (skip prefix for default lang) */
export function langHref(url, lang) {
  if (!url || !url.startsWith("/") || lang === DEFAULT_LANG) return url || "/";
  return `/${lang}${url}`;
}

/** Home path for a given language */
export function langHome(lang) {
  return lang === DEFAULT_LANG ? "/" : `/${lang}`;
}

/** Get the other language(s) for the language switcher */
export function altLangs(lang) {
  return SUPPORTED_LANGS.filter((l) => l !== lang);
}

/** Detect language from a pathname */
export function langFromPath(pathname) {
  // Match the first segment exactly so "/frbg" isn't mistaken for "/fr"
  const firstSegment = (pathname || "").split("/")[1] || "";
  return SUPPORTED_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_LANG;
}
