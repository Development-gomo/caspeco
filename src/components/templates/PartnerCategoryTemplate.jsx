// src/components/templates/PartnerCategoryTemplate.jsx
// Partner category archive — /partner-category/{slug}, /en/partner-category/{slug} …
// Same as live: the category name and a grid of its partners (logo + name),
// each linking to the partner's own page.

import Image from "next/image";
import Link from "next/link";
import Shell from "./Shell";
import { entryHref } from "@/config";

export default function PartnerCategoryTemplate({ term, partners, lang, slug, themeOptions }) {
  return (
    // no entryId: term translations aren't exposed, so the switcher uses each language's homepage
    <Shell lang={lang} slug={slug} entryType="partner_category" themeOptions={themeOptions}>
      <div className="h-28 w-full bg-black"></div>
      <section className="cs-container py-15 md:py-30">
        <h1 className="cs-h2 mb-6" dangerouslySetInnerHTML={{ __html: term.name }} />
        {term.description && <div className="cs-p2 cs-rich mb-12 max-w-3xl" dangerouslySetInnerHTML={{ __html: term.description }} />}

        {partners.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => {
              const logo = partner?._embedded?.["wp:featuredmedia"]?.[0];
              return (
                <li key={partner.id}>
                  <Link
                    href={entryHref("partner", partner.slug, lang)}
                    className="group flex h-full flex-col overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.16)]"
                  >
                    <div className="relative aspect-[495/400] w-full bg-(--color-light-grey)">
                      {logo?.source_url && (
                        <Image src={logo.source_url} alt={logo.alt_text || ""} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-contain p-6" />
                      )}
                    </div>
                    <span className="p-6 text-[20px] font-bold leading-6 group-hover:underline" dangerouslySetInnerHTML={{ __html: partner.title?.rendered || "" }} />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-(--color-grey-medium-dark)">No partners in this category yet.</p>
        )}
      </section>
    </Shell>
  );
}
