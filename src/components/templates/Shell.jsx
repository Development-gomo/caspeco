// src/components/templates/Shell.jsx
// Header + <main> + Footer wrapper shared by the localized-route templates.

import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { getTranslationMap } from "@/lib/api";
import { altLangUrls } from "@/lib/translations";

// Header with the language-switcher links from the server (one cached WP call), not from the browser.
// Its own async component so the translation lookup runs alongside the page content (sibling server
// components render concurrently) instead of holding the content back until it returns.
export async function LangHeader({ lang, entryId = null, routeType = null, themeOptions }) {
  const map = entryId ? await getTranslationMap(entryId, lang) : null;
  return (
    <Header
      lang={lang}
      altLangUrls={altLangUrls(lang, { map, routeType, linkEntry: !!entryId })}
      prefetchedOptions={themeOptions || {}}
      logoUrl={themeOptions?.logo_light?.url || ""}
    />
  );
}

export default function Shell({ lang, slug, entryType, routeType = null, entryId = null, themeOptions, children, mainClassName, hideQuickContact = false }) {
  return (
    <>
      <LangHeader lang={lang} entryId={entryId} routeType={routeType} themeOptions={themeOptions} />
      <main className={mainClassName}>{children}</main>
      <Footer lang={lang} currentSlug={slug} hideQuickContact={hideQuickContact} />
    </>
  );
}
