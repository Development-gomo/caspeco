// src/lib/postStrings.js
// UI labels for the single-post template's related cards (it has no ACF section fields).
// One entry per SUPPORTED_LANGS code; falls back to English. Add a language here when
// adding one to src/config (see docs/ARCHITECTURE.md → "Adding a new language").

export const POST_STRINGS = {
  en: { relatedHeading: "Related articles", readMore: "Read article", readSuffix: "min read" },
  sv: { relatedHeading: "Relaterade artiklar", readMore: "Läs artikeln", readSuffix: "min läsning" },
  no: { relatedHeading: "Relaterte artikler", readMore: "Les artikkelen", readSuffix: "min lesing" },
  fr: { relatedHeading: "Articles similaires", readMore: "Lire l’article", readSuffix: "min de lecture" },
  frbg: { relatedHeading: "Articles similaires", readMore: "Lire l’article", readSuffix: "min de lecture" },
  nl: { relatedHeading: "Gerelateerde artikelen", readMore: "Lees artikel", readSuffix: "min leestijd" },
};

export const postStrings = (lang) => POST_STRINGS[lang] || POST_STRINGS.en;
