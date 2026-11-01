// src/components/sections/inner-pages/IntegrationsListing.jsx
// ACF layout: integrations_listing — every partner grouped by partner category, like live /integrationer/.
// Intro (heading, short_text, CTA) on top; below, a category nav (sticky sidebar from md, wrapping
// chips on mobile) with anchor links to one section per non-empty category: a grid of partner
// cards (logo + name) linking to each partner page. A partner in several categories shows in each.
// Categories and partners are fetched on the server (PageBuilder); section fields are all optional.

import Image from "next/image";
import Link from "next/link";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, entryHref, langHref } from "@/config";
import { sectionBackground, toHtml } from "@/lib/content";

function PartnerCard({ partner, lang }) {
  const logo = partner?._embedded?.["wp:featuredmedia"]?.[0];
  return (
    <Link
      href={entryHref("partner", partner.slug, lang)}
      className="group flex h-full flex-col overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.16)]"
    >
      <div className="relative aspect-[495/400] w-full bg-(--color-light-grey)">
        {logo?.source_url && (
          <Image src={logo.source_url} alt={logo.alt_text || ""} fill sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 768px) 30vw, 50vw" className="object-contain p-4 md:p-6" />
        )}
      </div>
      <span className="p-4 text-[16px] font-bold leading-5 group-hover:underline md:p-6 md:text-[20px] md:leading-6" dangerouslySetInnerHTML={{ __html: partner.title?.rendered || "" }} />
    </Link>
  );
}

export default function IntegrationsListing({ data, lang = DEFAULT_LANG, categories, partners }) {
  const list = Array.isArray(partners) ? partners : [];
  if (list.length === 0) return null;

  // API order (alphabetical); categories without partners are skipped
  const groups = (Array.isArray(categories) ? categories : [])
    .map((cat) => ({ ...cat, partners: list.filter((p) => p.partner_category?.includes(cat.id)) }))
    .filter((cat) => cat.partners.length > 0);

  const { heading, short_text, cta_text, cta_url } = data || {};

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {(heading || short_text || (cta_text && cta_url)) && (
          <div className="flex flex-col items-start gap-6">
            {heading && <h2 className="cs-h2 cs-highlight max-w-[985px] text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className="cs-p1 cs-rich max-w-[680px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
            {cta_text && cta_url && (
              <CtaButton variant="outline-dark" href={langHref(cta_url.trim(), lang)}>
                {cta_text}
              </CtaButton>
            )}
          </div>
        )}

        {groups.length > 0 && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[200px_1fr] md:gap-8 lg:grid-cols-[240px_1fr] lg:gap-16">
            {/* mobile: wrapping chips above the groups; md+: sticky sidebar below the fixed header */}
            <nav aria-label="Partner categories" className="md:sticky md:top-32 md:self-start">
              <ul className="flex flex-wrap gap-2 md:flex-col md:gap-3">
                {groups.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`#partner-cat-${cat.slug}`}
                      className="inline-block rounded-full border border-(--color-grey-medium) px-3 py-1 text-[16px] font-medium leading-[22px] text-(--color-grey-dark) transition-colors hover:border-(--color-black) hover:text-(--color-black) md:rounded-none md:border-0 md:p-0 md:text-[18px]"
                    >
                      <span className="cs-link-draw" dangerouslySetInnerHTML={{ __html: cat.name }} />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex min-w-0 flex-col gap-12 lg:gap-16">
              {groups.map((cat) => (
                // scroll margin clears the fixed header (88px) so the heading isn't hidden
                <div key={cat.id} id={`partner-cat-${cat.slug}`} className="scroll-mt-32">
                  <h3 className="cs-h4 mb-6 text-(--color-heading)" dangerouslySetInnerHTML={{ __html: cat.name }} />
                  <ul className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
                    {cat.partners.map((partner) => (
                      <li key={partner.id}>
                        <PartnerCard partner={partner} lang={lang} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
