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
