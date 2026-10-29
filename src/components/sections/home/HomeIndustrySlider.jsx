// src/components/sections/home/HomeIndustrySlider.jsx
// ACF layout: industry_slider_section — "Pick your industry" card slider.
// Cards come from the "industries" CPT (current language, fetched in PageBuilder):
// title, featured image and permalink. An optional ACF `icon` image on the CPT
// overrides the default fork-and-knife icon from the Figma design.
// Cards run off the right edge (Figma "Card presentation more than 4"); arrows and dots page through.
// Mobile (< 768, Figma "Tailor your solution mobile"): swipe only, 32px gaps, no arrows, the
// graded "Slider points" (MobileDots) centred 24px under the cards; section padding 64.

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import DefaultIcon from "../../../../public/icons/home/industry-icon.svg";
import ArrowLink from "@/components/ui/ArrowLink";
import SliderArrows from "@/components/ui/SliderArrows";
import { DEFAULT_LANG, entryHref, langHref } from "@/config";
import { mediaUrl, sectionBackground, toHtml } from "@/lib/content";

// CPT entry → card data
function toCard(post) {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  return {
    id: post.id,
    title: post?.title?.rendered || "",
    image: media?.source_url ? { url: media.source_url, alt: media.alt_text || "" } : null,
    icon: post?.acf?.icon || null,
    slug: post?.slug || "",
  };
}

function IndustryCard({ card, lang }) {
  const href = card.slug ? entryHref("industry", card.slug, lang) : "";
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="group relative block h-[394px] w-full overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)]"
    >
      {/* Figma "Sector card" hover (Smart Animate 100 ms ease-out): the #151411 overlay goes
          30% → 100% (card turns dark), the glow 30% → 20%, icon + label grow ~1.11× */}
      {mediaUrl(card.image) && (
        <Image src={mediaUrl(card.image)} alt={card.image?.alt || ""} fill sizes="276px" className="object-cover" />
      )}
      <span className="absolute inset-0 bg-[#151411] opacity-30 transition-opacity duration-100 ease-out group-hover:opacity-100 group-focus-visible:opacity-100" />
      <span
        className="absolute inset-0 transition-opacity duration-100 ease-out group-hover:opacity-[0.667] group-focus-visible:opacity-[0.667]"
        style={{ backgroundImage: "linear-gradient(145deg, rgba(253,253,253,0.3) 0%, rgba(253,253,253,0) 99.5%)" }}
      />
      <span className="absolute inset-x-6 top-[139px] flex origin-center flex-col items-center gap-[7px] text-center transition-transform duration-100 ease-out group-hover:scale-[1.11] group-focus-visible:scale-[1.11]">
        <Image src={mediaUrl(card.icon) || DefaultIcon} alt="" width={64} height={64} className="size-16" />
        {card.title && (
          <span
            className="font-bold text-[26px] leading-[1.1] tracking-[-0.52px] uppercase text-(--color-light-grey)"
            dangerouslySetInnerHTML={{ __html: card.title }}
          />
        )}
      </span>
    </Wrapper>
  );
}

function Dots({ pages, active, onSelect, className = "" }) {
  return (
    <div className={`flex items-center gap-[9px] ${className}`}>
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i + 1} / ${pages}`}
          aria-current={active === i}
          onClick={() => onSelect(i)}
          className={`cursor-pointer rounded-full transition-all duration-300 ${
            active === i ? "size-[12.6px] bg-(--color-yellow)" : "size-[7px] bg-white hover:bg-(--color-yellow)/60"
          }`}
        />
      ))}
    </div>
  );
}

// Figma mobile "Slider points" (md:hidden): 13 / 10 / 8px by distance from the active snap,
// 11px apart, inactive #FDFDFD on this section's background (same look as ui/MobileSlider).
const DOT_SIZE = [13, 10, 8];
function MobileDots({ pages, active, onSelect }) {
  if (pages < 2) return null;
  return (
    <div className="flex items-center justify-center gap-[11px] md:hidden">
      {Array.from({ length: pages }, (_, i) => {
        const d = Math.abs(i - active);
        if (d > 2) return null;
        return (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1} / ${pages}`}
            aria-current={d === 0 ? "true" : undefined}
            onClick={() => onSelect(i)}
            className="shrink-0 cursor-pointer rounded-full transition-[width,height,background-color] duration-300 ease-out"
            style={{ width: DOT_SIZE[d], height: DOT_SIZE[d], backgroundColor: d === 0 ? "#FFC120" : "#FDFDFD" }}
          />
        );
      })}
    </div>
  );
}

// Controls under the cards: arrows + optional cta_text/cta_url link, dots on the right
export default function HomeIndustrySlider({ data, lang = DEFAULT_LANG, prefetchedIndustries }) {
  const cards = (Array.isArray(prefetchedIndustries) ? prefetchedIndustries : []).map(toCard).filter((c) => c.title);
  const swiperRef = React.useRef(null);
  const [pages, setPages] = React.useState(1);
  const [active, setActive] = React.useState(0);
  const { heading, short_text, tagline, cta_text, cta_url } = data || {};
  if (!heading && cards.length === 0) return null;

  const syncPages = (swiper) => {
    setPages(swiper.snapGrid.length);
    setActive(swiper.snapIndex);
  };

  return (
    <section
      className="cs-sec overflow-hidden pt-12 pb-18 lg:pt-[72px] lg:pb-36"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.5) 0.94%, #dadcdd 80.71%)",
      })}
    >
      <div className="cs-container flex flex-col gap-10 lg:gap-16 max-md:gap-6">
        <div className="flex flex-col gap-4 max-md:gap-6">
          {heading && <h2 className="cs-h2 cs-highlight text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <div className="cs-p1 cs-rich max-w-[636px] text-(--color-grey-dark) max-md:font-normal!" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {tagline && (
            <p className="text-[14px] lg:text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-heading) max-md:-mt-1 max-md:text-[18px] max-md:font-bold max-md:leading-[22px] max-md:tracking-[-0.36px]">
              {tagline}
            </p>
          )}
        </div>

        {cards.length > 0 && (
          <div className="flex flex-col items-center gap-8 max-md:gap-6">
            <Swiper
              onSwiper={(s) => {
                swiperRef.current = s;
                syncPages(s);
              }}
              onSnapGridLengthChange={syncPages}
              onSlideChange={(s) => setActive(s.snapIndex)}
              slidesPerView="auto"
              spaceBetween={32}
              breakpoints={{ 768: { spaceBetween: 24 }, 1024: { spaceBetween: 48 } }}
              className="w-full !overflow-visible"
            >
              {cards.map((card, i) => (
                <SwiperSlide key={i} className="!w-[276px]">
                  <IndustryCard card={card} lang={lang} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Figma "Frame 8934350" (industry module): arrows + text link left, dots right */}
            <div className={`flex w-full flex-wrap items-center justify-between gap-6 ${cta_text && cta_url ? "" : "max-md:hidden"}`}>
              <div className="flex flex-wrap items-center gap-8 lg:gap-12">
                <SliderArrows index={active} count={pages} onChange={(i) => swiperRef.current?.slideTo(i)} className="max-md:hidden" />
                {cta_text && cta_url && <ArrowLink href={langHref(cta_url.trim(), lang)}>{cta_text}</ArrowLink>}
              </div>
              {pages > 1 && <Dots pages={pages} active={active} onSelect={(i) => swiperRef.current?.slideTo(i)} className="max-md:hidden" />}
            </div>
            <MobileDots pages={pages} active={active} onSelect={(i) => swiperRef.current?.slideTo(i)} />
          </div>
        )}
      </div>
    </section>
  );
}
