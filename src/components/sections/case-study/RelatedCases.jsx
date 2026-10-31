// src/components/sections/case-study/RelatedCases.jsx
// ACF layout: case_study_slider ("Related Case Study Listing"): heading, text and the other case
// studies of the same language as full-image cards in a Swiper slider (current case excluded by
// the builder). Below the slider: yellow arrows (SliderArrows) left, dot indicators right; on mobile only the dots.
// All copy comes from ACF / the cases themselves.

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Reveal from "@/components/ui/Reveal";
import SliderArrows from "@/components/ui/SliderArrows";
import { DEFAULT_LANG, entryHref } from "@/config";
import { sectionBackground, toHtml } from "@/lib/content";
import { postStrings } from "@/lib/postStrings";
import ArrowLight from "../../../../public/icons/home/arrow-light.svg";

const MAX_CASES = 12;

export default function RelatedCases({ data, lang = DEFAULT_LANG, cases = [] }) {
  const list = (Array.isArray(cases) ? cases : []).filter((c) => c.slug && (c.image?.url || c.bannerImage?.url)).slice(0, MAX_CASES);
  const swiperRef = React.useRef(null);
  const [index, setIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(1);
  const { heading, short_text, read_more_text } = data || {};
  const readMore = read_more_text || postStrings(lang).readFullCase;
  if (list.length === 0) return null;

  // Dots follow Swiper's real snap positions (with 3.2 slides visible the last slides share one position)
  const sync = (s) => {
    setIndex(s.snapIndex);
    setSnapCount(s.snapGrid.length);
  };

  return (
    <section className="cs-sec overflow-hidden py-18 lg:py-36" style={sectionBackground(data, { background: "#F1F1F1" })}>
      <div className="cs-container flex flex-col gap-10 max-md:gap-8 lg:gap-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {(heading || short_text) && (
            <Reveal className="flex flex-col gap-6">
              {heading && <h2 className="cs-h2 cs-highlight cs-rich max-w-[985px] text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
              {short_text && <div className="cs-p2 cs-rich max-w-[680px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
            </Reveal>
          )}
        </div>

        {/* Slides bleed to the right edge of the screen; the left side is clipped at the container edge */}
        <div className="[clip-path:inset(-24px_-100vw_-24px_0)]">
          <Swiper
            onSwiper={(s) => {
              swiperRef.current = s;
              sync(s);
            }}
            onSlideChange={sync}
            onReachEnd={sync}
            onResize={sync}
            onBreakpoint={sync}
            slidesPerView={1.15}
            spaceBetween={24}
            breakpoints={{
              768: { slidesPerView: 2.2, spaceBetween: 24 },
              1280: { slidesPerView: 3.2, spaceBetween: 32 },
            }}
            className="w-full !overflow-visible"
          >
            {list.map((c) => {
              const image = c.image || c.bannerImage;
              return (
                <SwiperSlide key={c.id} className="!h-auto">
                  <Link
                    href={entryHref("casestudy", c.slug, lang)}
                    className="group relative flex h-[480px] flex-col justify-end overflow-hidden rounded-[16px] bg-(--color-black) p-6 text-(--color-white) shadow-[0px_4px_12px_rgba(0,0,0,0.16)] lg:h-[540px] lg:p-8 max-md:h-[460px]"
                  >
                    <Image src={image.url} alt={image.alt || ""} fill sizes="(min-width: 1280px) 403px, (min-width: 768px) 45vw, 85vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 19.8%, #000 100%)" }} aria-hidden />
                    {c.logo?.url && (
                      <Image
                        src={c.logo.url}
                        alt={c.logo.alt || c.title || ""}
                        width={134}
                        height={48}
                        unoptimized={/\.svg(\?|$)/i.test(c.logo.url)}
                        className="absolute left-6 top-6 h-9 w-auto max-w-[134px] object-contain object-left lg:left-8 lg:top-8 lg:h-12"
                      />
                    )}
                    <div className="relative flex flex-col gap-6">
                      <h3 className="font-bold text-[26px] lg:text-[32px] leading-[1.1] tracking-[-0.64px] normal-case max-md:leading-7 max-md:tracking-[-0.52px]">{c.title}</h3>
                      {(c.personName || c.designation) && (
                        <div className="flex items-center gap-3">
                          <span className="h-12 w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow)" aria-hidden />
                          <span className="flex flex-col gap-1">
                            {c.personName && <span className="font-bold text-[20px] leading-6 tracking-[-0.4px]">{c.personName}</span>}
                            {c.designation && <span className="font-medium text-[16px] leading-5">{c.designation}</span>}
                          </span>
                        </div>
                      )}
                      {/* the whole card is the link, so this is styled like ArrowLink but is not an anchor */}
                      <span className="inline-flex items-center gap-2 self-end text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-light-grey)">
                        <span className="underline decoration-1 underline-offset-2">{readMore}</span>
                        <Image src={ArrowLight} alt="" width={17.5} height={11} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {list.length > 1 && snapCount > 1 && (
          <div className="flex items-center justify-between gap-6 max-md:justify-center">
            {/* Mobile: dots only, no arrows */}
            <SliderArrows
              index={index}
              count={snapCount}
              onChange={(i) => swiperRef.current?.slideTo(Math.max(0, Math.min(snapCount - 1, i)))}
              className="max-md:hidden"
            />
            <div className="flex items-center gap-3" role="tablist">
              {Array.from({ length: snapCount }, (_, i) => {
                const active = i === index;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={list[i]?.title || String(i + 1)}
                    onClick={() => swiperRef.current?.slideTo(i)}
                    className={`cursor-pointer rounded-full transition-all duration-300 ${active ? "size-4 bg-(--color-yellow)" : "size-2 bg-[#DADCDD]"}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
