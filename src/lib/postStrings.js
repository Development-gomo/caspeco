// src/lib/postStrings.js
// UI labels for the single-post template's related cards (it has no ACF section fields),
// plus the "Read more / Read less" toggle of long texts (showMore / showLess).
// One entry per SUPPORTED_LANGS code; falls back to English. Add a language here when
// adding one to src/config (see docs/ARCHITECTURE.md → "Adding a new language").

export const POST_STRINGS = {
  en: { relatedHeading: "Related articles", readMore: "Read article", readSuffix: "min read", showMore: "Read more", showLess: "Read less", contactUs: "Contact us", otherPartners: "Other partners" },
  sv: { relatedHeading: "Relaterade artiklar", readMore: "Läs artikeln", readSuffix: "min läsning", showMore: "Läs mer", showLess: "Visa mindre", contactUs: "Kontakta oss", otherPartners: "Andra partners" },
  no: { relatedHeading: "Relaterte artikler", readMore: "Les artikkelen", readSuffix: "min lesing", showMore: "Les mer", showLess: "Vis mindre", contactUs: "Kontakt oss", otherPartners: "Andre partnere" },
  fr: { relatedHeading: "Articles similaires", readMore: "Lire l’article", readSuffix: "min de lecture", showMore: "Lire la suite", showLess: "Voir moins", contactUs: "Contactez-nous", otherPartners: "Autres partenaires" },
  frbg: { relatedHeading: "Articles similaires", readMore: "Lire l’article", readSuffix: "min de lecture", showMore: "Lire la suite", showLess: "Voir moins", contactUs: "Contactez-nous", otherPartners: "Autres partenaires" },
  nl: { relatedHeading: "Gerelateerde artikelen", readMore: "Lees artikel", readSuffix: "min leestijd", showMore: "Lees meer", showLess: "Toon minder", contactUs: "Neem contact op", otherPartners: "Andere partners" },
};

export const postStrings = (lang) => POST_STRINGS[lang] || POST_STRINGS.en;
