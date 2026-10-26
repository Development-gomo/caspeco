// src/components/templates/EntryTemplate.jsx
// Generic single entry (products, partners, child pages): renders the ACF
// page_builder when the entry has one, otherwise the title + WordPress content.
// Swap in a dedicated template once a design exists for the type.

import Image from "next/image";
import PageBuilder from "@/components/major/PageBuilder";
import Shell from "./Shell";

export default function EntryTemplate({ entry, lang, slug, entryType, routeType = null, themeOptions, linkTranslations = true }) {
  const sections = entry?.acf?.page_builder;
  const hasBuilder = Array.isArray(sections) && sections.length > 0;
  const image = entry?._embedded?.["wp:featuredmedia"]?.[0];

  return (
    <Shell
      lang={lang}
      slug={slug}
      entryType={entryType}
      routeType={routeType}
      // without a localized route the switcher falls back to each language's homepage
      entryId={linkTranslations ? entry?.id : null}
      themeOptions={themeOptions}
      // the footer Quick contact would repeat the page's own form
      hideQuickContact={hasBuilder && sections.some((b) => b?._layout === "contact_form_section" || b?._layout === "quick_contact_section")}
    >
      {hasBuilder ? (
        <PageBuilder sections={sections} lang={lang} />
      ) : (
        <>
          <div className="h-28 w-full bg-black"></div>
          <article className="web-width mx-auto max-w-4xl space-y-6 px-6 py-15 md:py-30">
            {entry?.title?.rendered && (
              <h1 className="text-4xl font-semibold text-center" dangerouslySetInnerHTML={{ __html: entry.title.rendered }} />
            )}
            {image?.source_url && (
              <div className="relative h-80 w-full overflow-hidden rounded-lg">
                <Image src={image.source_url} alt={image.alt_text || ""} fill className="object-cover" sizes="(min-width: 1024px) 1024px, 100vw" priority />
              </div>
            )}
            {entry?.content?.rendered && (
              <div className="mx-auto max-w-3xl [&>p]:mb-6" dangerouslySetInnerHTML={{ __html: entry.content.rendered }} />
            )}
          </article>
        </>
      )}
    </Shell>
  );
}
