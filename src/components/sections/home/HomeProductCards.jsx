// src/components/sections/home/HomeProductCards.jsx
// ACF layout: product_cards_section — "Tailor your solution", up to 5 product cards.
// hover_image (optional) cross-fades in on card hover.
// Mobile (< 768, Figma "Frame 8934172"): swipe slider clipped at the container, 296×394 cards
// 32 apart, 12px clip inset for the shadow, graded dots 40 below; section padding 64 / 64
// (Product page: 0 below the dots, the USP section that follows brings its own 64).
// mobileBleed (product pages, client QA slide 43): the track runs to the screen edges (-mx-6 / px-6 / scroll-px-6), so cards are not clipped 24px in from the sides; resting position unchanged. Client QA slide 73: the homepage bleeds to the screen edges too.
// Mobile background (Figma): white base + linear-gradient(180deg, #DADCDD 80% -> #FFF 50%). Applied as
// Tailwind classes (max-md:), so only when no bg_color/bg_image is set; with a custom background (ProductBuilder
// always passes one) the inline style from sectionBackground() is used as before. md+ keeps light grey.

"use client";

import React from "react";
import Image from "next/image";
import ArrowLink from "@/components/ui/ArrowLink";
import CtaButton from "@/components/ui/CtaButton";
import { MOBILE_SLIDE, MOBILE_TRACK, SliderPoints } from "@/components/ui/MobileSlider";
import { DEFAULT_LANG, langHref } from "@/config";
import { hasText, mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// No inline style here, so the max-md: classes win; md+ stays var(--color-light-grey)
const MOBILE_BG = "bg-(--color-light-grey)"; // client QA slide 73: mobile keeps the desktop light grey (no white gradient)


// zoom: the first two cards scale their image 1.1× on hover
function ProductCard({ card, lang, zoom = false }) {
  const image = mediaUrl(card.image);
  const hover = mediaUrl(card.hover_image);
  const href = card.cta_url ? langHref(card.cta_url, lang) : "";

  return (
    <article className={`group relative flex h-full min-h-[394px] ${MOBILE_SLIDE} max-md:w-[296px] flex-col overflow-hidden rounded-lg bg-(--color-light-grey) px-6 pt-8 pb-8 shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)]`}>
      {image && (
        <div className={`relative mx-auto h-[167px] w-full ${zoom ? "transition-transform duration-300 ease-out group-hover:scale-105" : ""}`}>
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

      <div className="mt-[21px] flex flex-1 flex-col gap-2">
        {card.title && <h3 className="font-bold text-[26px] leading-7 tracking-[-0.52px] normal-case text-black">{card.title}</h3>}
        {card.text && (
          <div className="cs-rich font-light text-[18px] leading-[22px] tracking-[-0.36px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />
        )}
      </div>

      {/* Stretched link: the ::after overlay makes the whole card clickable */}
      {card.cta_text && href && (
        <ArrowLink href={href} className="mt-5 self-start after:absolute after:inset-0">
          {card.cta_text}
        </ArrowLink>
      )}
    </article>
  );
}

// cta ({ text, href }, optional): outline button under the intro text (dynamic_product_card_section); other callers pass none
export default function HomeProductCards({ data, lang = DEFAULT_LANG, mobileBleed = true, cta = null }) {
  const cards = rows(data?.cards).filter((c) => c.title);
  const { heading, short_text, tagline } = data || {};
  const hasHeading = hasText(heading);
  const hasShortText = hasText(short_text);
  const hasTagline = hasText(tagline);
  const hasIntro = hasHeading || hasShortText || hasTagline;
  const trackRef = React.useRef(null);
  // Nothing to show: no section at all (no padding / background height)
  if (!hasIntro && cards.length === 0) return null;
  const customBg = Boolean(data?.bg_color || mediaUrl(data?.bg_image));

  return (
    <section
      className={`cs-sec ${customBg ? "" : MOBILE_BG} pt-18 md:pt-36 ${data?._next === "industry_results_section" ? "pb-18 md:pb-36" : "pb-12 md:pb-[144px]"} ${data?._next === "usp_accordion_section" ? "max-md:[--sec-pb:0px]" : ""}`} style={customBg ? sectionBackground(data) : undefined}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {hasIntro && (
        <div className="flex flex-col gap-4">
          {hasHeading && <h2 className="cs-h2 cs-highlight text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {hasShortText && <div className="cs-p1 cs-rich max-w-[636px] text-(--color-grey-dark) max-md:font-normal!" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {hasTagline && (
            <p className="text-[14px] lg:text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-heading) max-md:mt-1 max-md:text-[18px] max-md:font-bold max-md:leading-[22px] max-md:tracking-[-0.36px]">
              {tagline}
            </p>
          )}
          {cta?.text && cta?.href && (
            <CtaButton variant="outline-dark-grey" href={langHref(cta.href, lang)} className="mt-4 max-md:mt-2 self-start">
              {cta.text}
            </CtaButton>
          )}
        </div>
        )}

        {cards.length > 0 && (
          <div
            ref={trackRef}
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] lg:gap-[29px] ${MOBILE_TRACK} max-md:gap-8 max-md:py-3 ${mobileBleed ? "max-md:-mx-6 max-md:px-6 max-md:scroll-px-6" : ""}`}
          >
            {cards.map((card, i) => (
              <ProductCard key={i} card={card} lang={lang} zoom={i < 2} />
            ))}
          </div>
        )}
        {cards.length > 1 && <SliderPoints trackRef={trackRef} count={cards.length} />}
      </div>
    </section>
  );
}
