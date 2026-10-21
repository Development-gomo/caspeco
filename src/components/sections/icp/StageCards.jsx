// src/components/sections/icp/StageCards.jsx
// ACF layout: stage_cards_section — Figma "Explore another stage" ("Find your next step"):
// heading, text and 3 full-image cards linking to the other ICP pages (title, text and a
// yellow "Explore →" link over a dark bottom gradient). The whole card is clickable.

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

function Arrow() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
      <path d="M0 6h15.5M10.5 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StageCards({ data, lang = DEFAULT_LANG }) {
  const cards = rows(data?.cards).filter((c) => c.title);
  const { heading, short_text } = data || {};
  if (!heading && cards.length === 0) return null;

  return (
    <section className="pt-12 pb-18 lg:pt-[72px] lg:pb-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {(heading || short_text) && (
          <Reveal className="flex flex-col gap-6">
            {heading && <h2 className="cs-h2 cs-highlight cs-rich max-w-[985px] text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className="cs-p1 cs-rich max-w-[680px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </Reveal>
        )}

        {cards.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {cards.map((card, i) => {
              const image = mediaUrl(card.image);
              const href = card.link_url ? langHref(card.link_url.trim(), lang) : "";
              const Wrapper = href ? Link : "div";
              return (
                <Reveal key={i} delay={0.1 + i * 0.1}>
                  <Wrapper
                    {...(href ? { href } : {})}
                    className="group relative flex h-[380px] flex-col justify-end overflow-hidden rounded-[8px] bg-(--color-black) p-6 text-(--color-light-grey) shadow-[0px_4px_12px_rgba(0,0,0,0.16)] lg:h-[422px] lg:p-8"
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={card.image?.alt || ""}
                        fill
                        sizes="(min-width: 768px) 403px, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    <span className="absolute inset-0 bg-linear-to-b from-black/0 via-black/35 to-black/90" aria-hidden />
                    <div className="relative flex flex-col gap-3">
                      <h3 className="font-bold text-[26px] lg:text-[32px] leading-[1.1] tracking-[-0.64px] normal-case">{card.title}</h3>
                      {card.text && <div className="cs-rich text-[16px] lg:text-[18px] font-light leading-[22px] tracking-[-0.36px]" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />}
                      {card.link_text && href && (
                        <span className="mt-6 inline-flex items-center gap-2 self-start text-[16px] font-medium text-(--color-yellow)">
                          <span className="cs-link-redraw">{card.link_text}</span>
                          <Arrow />
                        </span>
                      )}
                    </div>
                  </Wrapper>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
