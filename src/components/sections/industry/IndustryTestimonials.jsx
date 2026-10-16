// src/components/sections/industry/IndustryTestimonials.jsx
// ACF layout: industry_testimonials_section — Figma "Testimonial carousel" ("We've helped
// others get there"). Full-bleed photo with a dark gradient, heading, a row of frosted
// quote cards (465px) that runs off the right edge, then arrows, "01 / 06" counter,
// dash indicators, a text link and an outline button.
// Cards: the layout's own `cards` repeater if filled, otherwise every published case study
// (passed in as `cases`), showing only its logo, testimonial, person_name and designation.
// Motion: heading and card row reveal on scroll, cards slide in an endless loop (Swiper,
// drag/swipe or arrows), the background photo settles from a slight zoom, cards lift on hover.

"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import ArrowLink from "@/components/ui/ArrowLink";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import SliderArrows from "@/components/ui/SliderArrows";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, toHtml } from "@/lib/content";

const pad = (n) => String(n).padStart(2, "0");

// Case-study cards: only the latest few (getTwinCaseStudies returns newest first)
const MAX_CASES = 4;

// Figma: the accent bar next to the name cycles yellow → coral → petrol
const ACCENTS = ["var(--color-yellow)", "#E8735A", "var(--color-petrol)"];

// Plain-text quote in curly quotes (Figma: “The whole staff learned so quickly.”)
const curly = (q) => {
  if (!q || /<[a-z][\s\S]*>/i.test(q)) return q;
  const text = q.trim().replace(/^["“”']+|["“”']+$/g, "");
  return `“${text}”`;
};

function QuoteCard({ card, lang, accent }) {
  const logo = mediaUrl(card.logo);
  return (
    // Frosted glass (Figma): light diagonal gradient + 20px backdrop blur + hairline border.
    // No ancestor may use opacity < 1, filter or clip-path, or the blur sees nothing behind it.
    <figure
      className="flex h-full min-h-[286px] flex-col gap-10 rounded-[8px] border border-white/20 p-6 text-(--color-light-grey) shadow-[0px_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-[20px] transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-white/35"
      style={{ backgroundImage: "linear-gradient(135deg, rgba(253,253,253,0.22) 0%, rgba(253,253,253,0.08) 55%, rgba(253,253,253,0.04) 100%)" }}
    >
      {logo ? (
        <Image src={logo} alt={card.logo?.alt || card.company || ""} width={card.logo?.width || 155} height={card.logo?.height || 48} className="h-10 w-auto max-w-[155px] object-contain object-left lg:h-12" />
      ) : (
        <span className="h-10 lg:h-12" aria-hidden />
      )}
      {card.quote && (
        <blockquote
          className="mt-auto font-bold text-[26px] leading-8 tracking-[-0.52px] lg:text-[36px] lg:leading-10 lg:tracking-[-0.72px]"
          dangerouslySetInnerHTML={{ __html: toHtml(curly(card.quote)) }}
        />
      )}
      <figcaption className={`flex items-end justify-between gap-4 ${card.quote ? "" : "mt-auto"}`}>
        {(card.name || card.company) && (
          <span className="flex items-center gap-3">
            <span className="h-12 w-[3px] shrink-0 rounded-[10px] lg:h-14" style={{ background: accent || ACCENTS[0] }} aria-hidden />
            <span className="flex flex-col">
              {card.name && <span className="font-bold text-[22px] lg:text-[28px] leading-8 tracking-[-0.56px]">{card.name}</span>}
              {card.company && <span className="font-medium text-[18px] lg:text-[20px] leading-6 tracking-[0.15px]">{card.company}</span>}
            </span>
          </span>
        )}
        {card.link_text && (card.href || card.link_url) && (
          <ArrowLink tone="light" href={card.href || langHref(card.link_url.trim(), lang)} className="shrink-0">
            {card.link_text}
          </ArrowLink>
        )}
      </figcaption>
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

export default function IndustryTestimonials({ data, lang = DEFAULT_LANG, cases = [] }) {
  const ownCards = rows(data?.cards).filter((c) => c.quote);
  const cards = ownCards.length
    ? ownCards
    : cases.filter((c) => c.quote || c.personName || mediaUrl(c.logo)).slice(0, MAX_CASES).map(caseToCard); // newest first
  const swiperRef = React.useRef(null);
  const [index, setIndex] = React.useState(0);
  // Endless loop: Swiper needs more slides than fit on screen, so short lists are rendered
  // twice; index / counter / dashes always refer to the real card (realIndex % count).
  const loop = cards.length > 1;
  const slides = loop && cards.length < 8 ? [...cards, ...cards] : cards;
  const { heading, link_text, link_url, cta_text, cta_url } = data || {};
  if (!heading && cards.length === 0) return null;

  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-18 lg:py-36" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {bg && (
        <Reveal y={0} scale={1.08} duration={1.6} className="absolute inset-0 -z-10">
          <Image src={bg} alt="" fill sizes="100vw" className="object-cover" />
        </Reveal>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black via-black/70 to-black/20" aria-hidden />

      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {heading && (
          <Reveal as="h2" className="cs-h3 cs-highlight cs-rich max-w-[660px] font-extrabold text-(--color-light-grey)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}

        {cards.length > 0 && (
          // The slider runs from the container's left edge to the viewport's right edge and clips
          // there (loop clones before the first card stay hidden). py/-my keep hover lift unclipped.
          <Reveal delay={0.15} className="mr-[calc((100%-100vw)/2)]">
            <Swiper
              onSwiper={(s) => (swiperRef.current = s)}
              onSlideChange={(s) => setIndex(s.realIndex % cards.length)}
              loop={loop}
              slidesPerView="auto"
              spaceBetween={16}
              breakpoints={{ 1024: { spaceBetween: 32 } }}
              className="w-full !py-2 !-my-2"
            >
              {slides.map((card, i) => (
                <SwiperSlide key={i} className="!h-auto !w-[min(465px,85vw)]">
                  <QuoteCard card={card} lang={lang} accent={ACCENTS[(i % cards.length) % ACCENTS.length]} />
                </SwiperSlide>
              ))}
            </Swiper>
          </Reveal>
        )}

        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-8 lg:gap-12">
            <SliderArrows
              loop={loop}
              index={index}
              count={cards.length}
              onChange={(i) => (i < index ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext())}
            />
            {cards.length > 1 && (
              <div className="flex items-center gap-4 text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--color-light-grey)">
                <span aria-live="polite">
                  {pad(index + 1)} / {pad(cards.length)}
                </span>
                <div className="flex items-center gap-2" aria-hidden>
                  {cards.map((_, i) => (
                    <span key={i} className={`h-[3px] rounded-[2px] transition-all duration-300 ${i === index ? "w-9 bg-(--color-yellow)" : "w-6 bg-(--color-light-grey)"}`} />
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
            <CtaButton variant="outline-light" href={langHref(cta_url.trim(), lang)}>
              {cta_text}
            </CtaButton>
          )}
        </div>
      </div>
    </section>
  );
}
