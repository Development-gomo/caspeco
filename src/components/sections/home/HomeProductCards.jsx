// src/components/sections/home/HomeProductCards.jsx
// ACF layout: product_cards_section — "Tailor your solution", up to 5 product cards.
// hover_image (optional) cross-fades in on card hover.

import Image from "next/image";
import ArrowLink from "@/components/ui/ArrowLink";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

function ProductCard({ card, lang }) {
  const image = mediaUrl(card.image);
  const hover = mediaUrl(card.hover_image);
  const href = card.cta_url ? langHref(card.cta_url, lang) : "";

  return (
    <article className="group relative flex h-full min-h-[394px] flex-col overflow-hidden rounded-[8px] bg-(--color-light-grey) px-6 pt-12 pb-8 shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)]">
      {image && (
        <div className="relative mx-auto h-[150px] w-full max-w-[200px]">
          <Image
            src={image}
            alt={card.image?.alt || ""}
            fill
            sizes="200px"
            className={`object-contain transition-opacity duration-300 ${hover ? "group-hover:opacity-0" : ""}`}
          />
          {hover && (
            <Image src={hover} alt="" fill sizes="200px" className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
        </div>
      )}

      <div className="mt-6 flex flex-1 flex-col gap-2">
        {card.title && <h3 className="font-bold text-[26px] leading-7 tracking-[-0.52px] normal-case text-(--color-black)">{card.title}</h3>}
        {card.text && (
          <p className="font-light text-[18px] leading-[22px] tracking-[-0.36px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />
        )}
      </div>

      {/* Stretched link: the ::after overlay makes the whole card clickable */}
      {card.cta_text && href && (
        <ArrowLink href={href} className="mt-6 self-start after:absolute after:inset-0">
          {card.cta_text}
        </ArrowLink>
      )}
    </article>
  );
}

export default function HomeProductCards({ data, lang = DEFAULT_LANG }) {
  const cards = rows(data?.cards).filter((c) => c.title);
  const { heading, short_text, tagline } = data || {};
  if (!heading && cards.length === 0) return null;

  return (
    <section className="pt-18 pb-12 lg:pt-36 lg:pb-[72px]" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-4">
          {heading && <h2 className="cs-h2 cs-highlight text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <p className="cs-p1 max-w-[636px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {tagline && <p className="text-[14px] lg:text-[16px] font-medium leading-5 tracking-[-0.32px] text-black">{tagline}</p>}
        </div>

        {cards.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:gap-[29px]">
            {cards.map((card, i) => (
              <ProductCard key={i} card={card} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
