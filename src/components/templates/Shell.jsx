// src/components/templates/Shell.jsx
// Header + <main> + Footer wrapper shared by the localized-route templates.

import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";

export default function Shell({ lang, slug, entryType, routeType = null, entryId = null, themeOptions, children, mainClassName, hideQuickContact = false }) {
  return (
    <>
      <Header
        lang={lang}
        currentSlug={slug}
        entryType={entryType}
        routeType={routeType}
        entryId={entryId}
        prefetchedOptions={themeOptions || {}}
        logoUrl={themeOptions?.logo_light?.url || ""}
      />
      <main className={mainClassName}>{children}</main>
      <Footer lang={lang} currentSlug={slug} hideQuickContact={hideQuickContact} />
    </>
  );
}
