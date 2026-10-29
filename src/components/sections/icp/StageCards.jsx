// src/components/sections/icp/StageCards.jsx
// ACF layout: stage_cards_section — Figma "Explore another stage" ("Find your next step"):
// heading, text and 3 full-image cards linking to the other ICP pages (title, text and a
// yellow "Explore →" link over a dark bottom gradient). The whole card is clickable.
// Mobile (< 768, Figma ICP "Frame 1689"): full-bleed swipe slider of 295×330 cards 32 apart from
// x24, title 26/28, text Regular 18/22, 48 under the intro, graded dots 48 below, padding 64; the card reveal is off on mobile
// (cards off-screen to the side would otherwise stay invisible until swiped fully in).

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { MOBILE_SLIDE, MOBILE_TRACK, SliderPoints } from "@/components/ui/MobileSlider";
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
  const trackRef = React.useRef(null);
  if (!heading && cards.length === 0) return null;

  return (
    <section className="cs-sec pt-12 pb-18 lg:pt-[72px] lg:pb-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 max-md:gap-12 lg:gap-16">
        {(heading || short_text) && (
          <Reveal className="flex flex-col gap-6">
            {heading && <h2 className="cs-h2 cs-highlight cs-rich max-w-[985px] text-(--color-heading) max-md:text-(--color-black)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className="cs-p1 cs-rich max-w-[680px] text-(--color-grey-dark) max-md:font-normal!" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </Reveal>
        )}

        {cards.length > 0 && (
          <div ref={trackRef} className={`grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 ${MOBILE_TRACK} max-md:-mx-6 max-md:gap-8 max-md:px-6 max-md:scroll-px-6`}>
            {cards.map((card, i) => {
              const image = mediaUrl(card.image);
              // href: ready-made link (related_icp cards built from the ICP posts); link_url: ACF field
              const href = card.href || (card.link_url ? langHref(card.link_url.trim(), lang) : "");
              const Wrapper = href ? Link : "div";
              return (
                <Reveal key={i} delay={0.1 + i * 0.1} className={`${MOBILE_SLIDE} max-md:w-[295px] max-md:opacity-100! max-md:transform-none!`}>
                  <Wrapper
                    {...(href ? { href } : {})}
                    className="group relative flex h-[380px] flex-col justify-end overflow-hidden rounded-[16px] bg-(--color-black) p-6 text-(--color-white) shadow-[0px_4px_12px_rgba(0,0,0,0.16)] lg:h-[422px] lg:p-8 max-md:h-[330px]"
                  >
                    {image && (
                      <Image
                        src={image}
                        alt={card.image?.alt || ""}
                        fill
                        sizes="(min-width: 768px) 403px, 295px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                    {/* Figma: black 0% at 19.8% → 100% at the bottom */}
                    <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 19.8%, #000 100%)" }} aria-hidden />
                    <div className="relative flex flex-col gap-4">
                      <h3 className="font-bold text-[26px] lg:text-[32px] leading-[1.1] tracking-[-0.64px] normal-case max-md:leading-7 max-md:tracking-[-0.52px]">{card.title}</h3>
                      {card.text && <div className="cs-rich text-[16px] lg:text-[18px] font-light leading-[22px] tracking-[-0.36px] max-md:text-[18px] max-md:font-normal" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />}
                      {(card.link_text || card.href) && href && (
                        <span className="mt-4 inline-flex items-center gap-2 self-start text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-yellow) max-md:-mb-0.5">
                          <span className="cs-link-redraw">{card.link_text || "Explore"}</span>
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
        {cards.length > 1 && <SliderPoints trackRef={trackRef} count={cards.length} />}
      </div>
    </section>
  );
}
