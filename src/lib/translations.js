// src/lib/translations.js
// Language-switcher URLs, built on the server from a WPML translation map (see getTranslationMap in lib/api.js).

import { altLangs, langHome, langHref, entryHref } from "@/config";

/**
 * { [lang]: href } for every OTHER language shown in the switcher.
 * - no entry (homepage, 404, child pages) or no map (lookup failed) → each language's homepage; never hides everything
 * - entry + map → the translated URL; a language with no translation is left out (hidden)
 */
export function altLangUrls(lang, { map = null, routeType = null, linkEntry = false } = {}) {
  const others = altLangs(lang);
  if (!linkEntry || !map) return Object.fromEntries(others.map((l) => [l, langHome(l)]));
  const urls = {};
  for (const l of others) {
    const slug = map[l]?.slug;
    if (!slug) continue; // confirmed untranslated → hidden
    urls[l] = slug === "frontpage" ? langHome(l)
      : routeType ? entryHref(routeType, slug, l)
      : langHref(`/${slug}`, l);
  }
  return urls;
}
