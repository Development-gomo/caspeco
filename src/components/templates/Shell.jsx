// src/components/templates/Shell.jsx
// Header + <main> + Footer wrapper shared by the localized-route templates.

import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { getTranslationMap } from "@/lib/api";
import { altLangUrls } from "@/lib/translations";

export default async function Shell({ lang, slug, entryType, routeType = null, entryId = null, themeOptions, children, mainClassName, hideQuickContact = false }) {
  // language-switcher links come from the server (one cached WP call), not from the browser
  const map = entryId ? await getTranslationMap(entryId, lang) : null;
  return (
    <>
      <Header
        lang={lang}
        altLangUrls={altLangUrls(lang, { map, routeType, linkEntry: !!entryId })}
        prefetchedOptions={themeOptions || {}}
        logoUrl={themeOptions?.logo_light?.url || ""}
      />
      <main className={mainClassName}>{children}</main>
      <Footer lang={lang} currentSlug={slug} hideQuickContact={hideQuickContact} />
    </>
  );
}
