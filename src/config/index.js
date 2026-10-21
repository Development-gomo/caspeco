// src/config/index.js

// Fallback to "sv" so a missing env var on the host can't produce "/undefined" routes
export const DEFAULT_LANG = process.env.NEXT_PUBLIC_DEFAULT_LANG || "sv";
// WP REST root. In the browser it is the same-origin proxy (src/app/api/content), so the
// CMS host never appears client-side; Next compiles `typeof window` away per bundle.
export const WP_BASE = typeof window === "undefined" ? process.env.NEXT_PUBLIC_WP_BASE : "/api/content";

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

// ─── Language switcher — copied from WPML > Languages on live caspeco.com ─────
// Key order = WPML language order (the switcher lists the other languages in this order).
// names[x] = how this language is written when the site is viewed in language x
// (the "Translation (…)" columns in WPML); flag = file in /public/flags.
export const LANGUAGES = {
  en: {
    flag: "/flags/en.svg",
    names: { sv: "Engelska", en: "English", no: "Engelsk", fr: "Anglais", frbg: "English", nl: "Engels" },
  },
  no: {
    flag: "/flags/no.svg",
    names: { sv: "Norskt Bokmål", en: "Norwegian Bokmål", no: "Norsk bokmål", fr: "Norvégien Bokmål", frbg: "Norwegian Bokmål", nl: "Noors Bokmål" },
  },
  sv: {
    flag: "/flags/sv.svg",
    names: { sv: "Svenska", en: "Swedish", no: "Swedish", fr: "Suédois", frbg: "Swedish", nl: "Zweeds" },
  },
  fr: {
    flag: "/flags/fr.svg",
    names: { sv: "Franska", en: "French", no: "Fransk", fr: "Français", frbg: "Français", nl: "Frans" },
  },
  nl: {
    flag: "/flags/be.svg",
    names: { sv: "Nederländska", en: "Belgium Dutch", no: "Nederlandsk", fr: "Néerlandais", frbg: "België – NL", nl: "Nederlands" },
  },
  frbg: {
    flag: "/flags/be.svg",
    names: { sv: "Belgien franska", en: "Belgium French", no: "Belgia fransk", fr: "Belgique Français", frbg: "Belgique – FR", nl: "België Frans" },
  },
};

/** Name of language `code` as written in language `inLang` (falls back to its own name, then the code) */
export function langName(code, inLang = code) {
  const names = LANGUAGES[code]?.names || {};
  return names[inLang] || names[code] || code.toUpperCase();
}

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
  industry: { rest: "industries", base: { ...allLangs("bransch"), en: "industry", no: "bransje" } },
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

// <body> class per content type (see pageTypeFromPath)
export const BODY_CLASS = {
  post: "article",
  casestudy: "casestudy",
  product: "product",
  industry: "industry",
  partner: "partner",
  partnerCategory: "partner-category",
};

/**
 * Page type for a URL path, used as the <body> class:
 * "/" → "home", "/en/product/pos" → "product", "/artiklar/x" → "article",
 * "/kontakt" → "page", "/service/x" → "service"; child pages → "page".
 */
export function pageTypeFromPath(pathname) {
  const segments = (pathname || "").split("/").filter(Boolean);
  const lang = SUPPORTED_LANGS.includes(segments[0]) ? segments.shift() : DEFAULT_LANG;
  if (segments.length === 0) return "home";
  if (segments.length === 2 && segments[0] === "service") return "service";
  if (segments.length === 2) {
    const type = typeFromBase(segments[0], lang);
    if (type) return BODY_CLASS[type] || type;
  }
  return "page";
}

/** Every class pageTypeFromPath can return (to swap the body class on client navigation) */
export const PAGE_TYPES = ["home", "page", "service", ...Object.values(BODY_CLASS)];

/** Prefix a local path with the current language (skip prefix for default lang) */
export function langHref(url, lang) {
  if (!url || !url.startsWith("/") || lang === DEFAULT_LANG) return url || "/";
  return `/${lang}${url}`;
}

/** Home path for a given language */
export function langHome(lang) {
  return lang === DEFAULT_LANG ? "/" : `/${lang}`;
}

/** Get the other language(s) for the language switcher, in WPML order (LANGUAGES key order) */
export function altLangs(lang) {
  const order = Object.keys(LANGUAGES);
  const rank = (l) => (order.includes(l) ? order.indexOf(l) : order.length);
  return SUPPORTED_LANGS.filter((l) => l !== lang).sort((a, b) => rank(a) - rank(b));
}

/** Detect language from a pathname */
export function langFromPath(pathname) {
  // Match the first segment exactly so "/frbg" isn't mistaken for "/fr"
  const firstSegment = (pathname || "").split("/")[1] || "";
  return SUPPORTED_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_LANG;
}
