// src/components/templates/PartnerTemplate.jsx
// Single partner — /partner/{slug}, /en/partner/{slug} …
// Same structure as the live page: logo, title, subtitle and a yellow "Contact us" button in the
// hero, the WordPress body (numbered steps …) in a reading column, then the other partners.
// Partners carry no ACF; the body starts with the logo, an H2 title and an H3 subtitle, which the
// hero takes over (removed from the body so they aren't repeated).

import Image from "next/image";
import Link from "next/link";
import PageBuilder from "@/components/major/PageBuilder";
import CtaButton from "@/components/ui/CtaButton";
import Shell from "./Shell";
import { getOtherPartners } from "@/lib/api";
import { postStrings } from "@/lib/postStrings";
import { entryHref, langHref } from "@/config";

const stripTags = (html) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

// First <h3> becomes the subtitle; the leading logo paragraph and first <h2> (the title) are dropped
function splitBody(html) {
  let body = html || "";
  body = body.replace(/^\s*<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?\s*<\/p>/i, "");
  body = body.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, "");
  let subtitle = "";
  body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/i, (_, inner) => {
    subtitle = stripTags(inner);
    return "";
  });
  return { body, subtitle };
}

export default async function PartnerTemplate({ entry, lang, slug, themeOptions }) {
  const strings = postStrings(lang);
  const featured = entry?._embedded?.["wp:featuredmedia"]?.[0];
  // fallback: the logo image at the start of the body
  const bodyLogo = (entry?.content?.rendered || "").match(/<img[^>]*\ssrc="([^"]+)"/i)?.[1];
  const logo = featured?.source_url ? featured : bodyLogo ? { source_url: bodyLogo, alt_text: "" } : null;
  const sections = entry?.acf?.page_builder;
  const hasBuilder = Array.isArray(sections) && sections.length > 0;
  const { body, subtitle } = splitBody(entry?.content?.rendered);
  const contactUrl = themeOptions?.button_url ? langHref(themeOptions.button_url, lang) : null;
  const others = await getOtherPartners(entry?.id, lang);

  return (
    <Shell lang={lang} slug={slug} entryType="partner" routeType="partner" entryId={entry?.id} themeOptions={themeOptions}>
      {/* HERO */}
      <section className="bg-(--color-black) pt-28 text-white">
        <div className="cs-container flex flex-col items-start gap-6 pb-12 lg:gap-8 lg:pb-20">
          {logo?.source_url && (
            <div className="relative h-20 w-56 rounded-[8px] bg-white lg:h-24 lg:w-64">
              <Image src={logo.source_url} alt={logo.alt_text || ""} fill sizes="256px" className="object-contain p-4" priority unoptimized={/\.svg(\?|$)/i.test(logo.source_url)} />
            </div>
          )}
          <h1 className="cs-h3 text-white" dangerouslySetInnerHTML={{ __html: entry?.title?.rendered || "" }} />
          {subtitle && <p className="max-w-2xl text-[18px] leading-7 text-(--color-light-grey) lg:text-[22px] lg:leading-8">{subtitle}</p>}
          {contactUrl && <CtaButton href={contactUrl}>{strings.contactUs}</CtaButton>}
        </div>
      </section>

      {/* BODY */}
      <article className="cs-container py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[730px]">
          {!hasBuilder && body && <div className="cs-article" dangerouslySetInnerHTML={{ __html: body }} />}
        </div>
      </article>
      {hasBuilder && <PageBuilder sections={sections} lang={lang} />}

      {/* OTHER PARTNERS */}
      {others.length > 0 && (
        <section className="bg-(--color-light-grey) py-14 lg:py-24">
          <div className="cs-container flex flex-col gap-10">
            <h2 className="cs-h3 text-black">{strings.otherPartners}</h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((partner) => {
                const img = partner?._embedded?.["wp:featuredmedia"]?.[0];
                return (
                  <li key={partner.id}>
                    <Link
                      href={entryHref("partner", partner.slug, lang)}
                      className="group flex h-full flex-col overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.16)]"
                    >
                      <div className="relative aspect-[495/400] w-full bg-(--color-light-grey)">
                        {img?.source_url && (
                          <Image src={img.source_url} alt={img.alt_text || ""} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-contain p-6" unoptimized={/\.svg(\?|$)/i.test(img.source_url)} />
                        )}
                      </div>
                      <span className="p-6 text-[20px] font-bold leading-6 group-hover:underline" dangerouslySetInnerHTML={{ __html: partner.title?.rendered || "" }} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </Shell>
  );
}
