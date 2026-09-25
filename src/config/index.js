// src/config/index.js

export const DEFAULT_LANG = process.env.NEXT_PUBLIC_DEFAULT_LANG;
export const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE;

// ─── Add new languages here — everything else updates automatically ───────────
export const SUPPORTED_LANGS = ["sv", "en", "no", "da", "fi", "de"];

// Locale map for OG/SEO tags (add new entries when adding languages)
export const LOCALE_MAP = {sv: "sv_SE", en: "en_US", no: "no_NO", da: "da_DK", fi: "fi_FI", de: "de_DE" };

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
  for (const l of SUPPORTED_LANGS) {
    if (l !== DEFAULT_LANG && pathname.includes(`/${l}`)) return l;
  }
  return DEFAULT_LANG;
}