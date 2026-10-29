// src/components/sections/industry/IndustryTestimonials.jsx
// "Card Slider" testimonial layout (slider_type = card, see TestimonialSlider) — Figma
// "Testimonial carousel" ("We've helped others get there"). Full-bleed photo with a dark
// gradient, heading, a row of frosted quote cards (465px) that runs off the right edge,
// then arrows, "01 / 06" counter, dash indicators, a text link and an outline button.
// Cards: the latest case studies (passed in as `cases`), showing their logo, testimonial,
// person_name and designation.
// Motion: heading and card row reveal on scroll, cards slide in an endless loop (Swiper,
// drag/swipe or arrows), the background photo settles from a slight zoom, cards lift on hover.
// Mobile (< 768, final Figma Product "Frame 8934401" / Industry "Frame 8934361"): H2 → 40 → one
// full-width 345 card (no peek, 24 apart, no loop) → 40 → graded slider dots (centred) → 23.4 → yellow
// "All cases" text link; 64 above, 20.6 below (Product frame: 19.4 / 24.6). No outline button, arrows or counter. The card is the
// desktop card scaled to 345 (radius 5.9, padding 17.8, 40 logo → quote, 17.8 quote → footer).
// variant "industry": 30px between the arrows (Industry mockup); ICP mockups use 24.

"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ArrowLink from "@/components/ui/ArrowLink";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import SliderArrows from "@/components/ui/SliderArrows";
import { GLASS_CLASS, GLASS_STYLE } from "@/components/ui/glass";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, toHtml } from "@/lib/content";

const pad = (n) => String(n).padStart(2, "0");

// Figma "Slider points" (mobile): active 12.6px, then 10.1px, then 7.6px, 11.4px apart
const DOT_SIZE = [12.6, 10.1, 7.6];

// Case-study cards: only the latest few (getTwinCaseStudies returns newest first)
const MAX_CASES = 4;

// Figma: the accent bar next to the name cycles #FFC120 → #FF8D6A → #1F8690 (3×48, radius 10)
const ACCENTS = ["#FFC120", "#FF8D6A", "#1F8690"];

// Plain-text quote in curly quotes (Figma: “The whole staff learned so quickly.”)
const curly = (q) => {
  if (!q || /<[a-z][\s\S]*>/i.test(q)) return q;
  const text = q.trim().replace(/^["“”']+|["“”']+$/g, "");
  return `“${text}”`;
};

function QuoteCard({ card, lang, accent }) {
  const logo = mediaUrl(card.logo);
  return (
    // Figma glass card (465 wide, radius 8, padding 24): logo, 54px gap, quote Bold 32/32 -2%,
    // 24px gap, name Bold 24/28 -2% + designation Medium 18/24 0.15px next to a 3×48 accent bar.
    // No ancestor may use opacity < 1, filter or clip-path, or the backdrop blur sees nothing.
    <figure
      className={`flex h-full min-h-[286px] flex-col gap-[54px] rounded-[8px] p-6 text-(--color-white) transition-[translate] duration-300 hover:-translate-y-1 max-md:min-h-0 max-md:gap-10 max-md:rounded-[5.94px] max-md:p-[17.8px] max-md:shadow-[0px_3.96px_11.87px_0px_rgba(0,0,0,0.16)]! ${GLASS_CLASS}`}
      style={GLASS_STYLE}
    >
      {logo ? (
        <Image src={logo} alt={card.logo?.alt || card.company || ""} width={card.logo?.width || 155} height={card.logo?.height || 48} className="h-10 w-auto max-w-[155px] object-contain object-left lg:h-12 max-md:h-[35.6px] max-md:max-w-[115px]" />
      ) : (
        <span className="h-10 lg:h-12 max-md:h-[35.6px]" aria-hidden />
      )}
      <div className="mt-auto flex flex-col gap-6 max-md:gap-[17.8px]">
      {card.quote && (
        <blockquote
          className="font-bold text-[26px] leading-8 tracking-[-0.52px] max-md:leading-7 lg:text-[32px] lg:leading-8 lg:tracking-[-0.64px]"
          dangerouslySetInnerHTML={{ __html: toHtml(curly(card.quote)) }}
        />
      )}
      <figcaption className={`flex items-end justify-between gap-4 ${card.quote ? "" : "mt-auto"}`}>
        {(card.name || card.company) && (
          <span className="flex items-center gap-3 max-md:gap-[8.9px]">
            <span className="h-12 w-[3px] shrink-0 rounded-[10px] max-md:h-[35.6px] max-md:w-[2.2px] max-md:rounded-[7.4px]" style={{ background: accent || ACCENTS[0] }} aria-hidden />
            <span className="flex flex-col gap-1 max-md:gap-[3px]">
              {card.name && <span className="font-bold text-[22px] lg:text-[24px] leading-7 tracking-[-0.48px] max-md:text-[20px] max-md:leading-[20.77px] max-md:tracking-[-0.4px]">{card.name}</span>}
              {card.company && <span className="font-medium text-[16px] lg:text-[18px] leading-6 tracking-[0.15px] max-md:leading-4 max-md:tracking-[-0.32px] max-md:text-(--color-grey-medium)">{card.company}</span>}
            </span>
          </span>
        )}
        {card.link_text && (card.href || card.link_url) && (
          <ArrowLink tone="light" href={card.href || langHref(card.link_url.trim(), lang)} className="shrink-0">
            {card.link_text}
          </ArrowLink>
        )}
      </figcaption>
      </div>
    </figure>
  );
}

// case study (lib/caseStudies mapTwinCases) → card: logo, testimonial, person_name, designation
const caseToCard = (c) => ({
  logo: c.logo,
  quote: c.quote,
  name: c.personName,
  company: c.designation,
});

export default function IndustryTestimonials({ data, lang = DEFAULT_LANG, cases = [], variant }) {
  const cards = (Array.isArray(cases) ? cases : []).filter((c) => c.quote || c.personName || mediaUrl(c.logo)).slice(0, MAX_CASES).map(caseToCard); // newest first
  const swiperRef = React.useRef(null);
  const [index, setIndex] = React.useState(0);
  // Below 768 the Swiper is re-created (key) without loop and with Figma's 24px gap
  const [mobile, setMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767.98px)");
    const update = () => {
      setMobile(mq.matches);
      setIndex(0);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  // Endless loop: Swiper needs more slides than fit on screen, so short lists are rendered
  // twice; index / counter / dashes always refer to the real card (realIndex % count).
  const loop = cards.length > 1 && !mobile;
  const slides = loop && cards.length < 8 ? [...cards, ...cards] : cards;
  const { heading, link_text, link_url, cta_text, cta_url } = data || {};
  // mobile shows one text link ("All cases"): the section's link, else its button
  const mobileLinkText = link_text && link_url ? link_text : cta_text;
  const mobileLinkUrl = link_text && link_url ? link_url : cta_url;
  if (!heading && cards.length === 0) return null;

  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-18 lg:py-36 max-md:pt-16 max-md:pb-[20.6px]" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {bg && (
        // Figma: photo with 24.8px layer blur (scaled so the soft edge stays outside the section)
        <Reveal y={0} scale={1.08} duration={1.6} className="absolute inset-0 -z-10">
          <Image src={bg} alt="" fill sizes="100vw" className="scale-110 object-cover blur-[24.8px]" />
        </Reveal>
      )}
      {/* Figma "gradient layer": black 50% → 0, left → right */}
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(90deg, rgba(0, 0, 0, 0.5) -0.9%, rgba(0, 0, 0, 0) 110.8%)" }} aria-hidden />

      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {heading && (
          // Figma mobile H2: X-Bold 36/36, -4%
          <Reveal as="h2" className="cs-h3 cs-title cs-highlight cs-rich max-w-[660px] text-(--color-white) max-md:leading-9! max-md:tracking-[-1.44px]!" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}
        {cards.length > 0 && (
          // The slider runs from the container's left edge to the viewport's right edge and clips
          // there (loop clones before the first card stay hidden). py/-my keep hover lift unclipped.
          // Mobile: clipped to the container (Figma 345 frame), one card at a time
          <Reveal delay={0.15} className="mr-[calc((100%-100vw)/2)] max-md:mr-0">
            <Swiper
              key={mobile ? "m" : "d"}
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setIndex(s.realIndex % cards.length)}
              loop={loop}
              slidesPerView="auto"
              spaceBetween={mobile ? 24 : 16}
              breakpoints={{ 1024: { spaceBetween: 32 } }}
              className="w-full !py-2 !-my-2"
            >
              {slides.map((card, i) => (
                <SwiperSlide key={i} className="!h-auto !w-[min(465px,85vw)] max-md:w-full!">
                  <QuoteCard card={card} lang={lang} accent={ACCENTS[(i % cards.length) % ACCENTS.length]} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Reveal>
        )}

        {/* Mobile (final Figma "Slider points" + "All cases"): graded dots centred 40 under the card,
            then the yellow text link 20 below, left aligned. Arrows / counter are desktop only. */}
        {(cards.length > 1 || (mobileLinkText && mobileLinkUrl)) && (
          <div className="flex flex-col gap-[23.4px] md:hidden">
            {cards.length > 1 && (
              <div className="flex items-center justify-center gap-[11.4px]">
                {cards.map((_, i) => {
                  const d = Math.abs(i - index);
                  if (d > 2) return null;
                  const size = DOT_SIZE[d];
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={d === 0 ? "true" : undefined}
                      onClick={() => swiperRef.current?.slideTo(i)}
                      className="shrink-0 cursor-pointer rounded-full transition-[width,height,background-color] duration-300 ease-out"
                      style={{ width: size, height: size, backgroundColor: d === 0 ? "#FFC120" : "#DADCDD" }}
                    />
                  );
                })}
              </div>
            )}
            {mobileLinkText && mobileLinkUrl && (
              <ArrowLink tone="light" href={langHref(mobileLinkUrl.trim(), lang)} className="self-start text-(--color-yellow)!">
                {mobileLinkText}
              </ArrowLink>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-8 max-md:hidden">
          <div className="flex flex-wrap items-center gap-8 lg:gap-12 max-md:w-full max-md:justify-between max-md:gap-x-0 max-md:gap-y-6">
            <SliderArrows
              className={variant === "industry" ? "max-md:gap-[30px]" : "max-md:gap-6"}
              loop={loop}
              index={index}
              count={cards.length}
              onChange={(i) => (i < index ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext())}
            />
            {cards.length > 1 && (
              <div className="flex items-center gap-[19px] text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--color-white) max-md:flex-col max-md:items-start max-md:gap-[10px]">
                <span aria-live="polite">
                  {pad(index + 1)} / {pad(cards.length)}
                </span>
                <div className="flex items-center gap-2" aria-hidden>
                  {cards.map((_, i) => (
                    <span key={i} className={`h-[3px] rounded-[2px] transition-all duration-300 ${i === index ? "w-9 bg-(--color-yellow) max-md:w-[34px]" : "w-6 bg-(--color-light-grey) max-md:w-[23px]"}`} />
                  ))}
                </div>
              </div>
            )}
            {link_text && link_url && (
              <ArrowLink tone="light" href={langHref(link_url.trim(), lang)}>
                {link_text}
              </ArrowLink>
            )}
          </div>
          {cta_text && cta_url && (
            <CtaButton variant="outline-soft-yellow" href={langHref(cta_url.trim(), lang)} className="max-md:hidden">
              {cta_text}
            </CtaButton>
          )}
        </div>
      </div>
    </section>
  );
}
