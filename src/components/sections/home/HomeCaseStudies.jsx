// src/components/sections/home/HomeCaseStudies.jsx
// ACF layout: casestudies_section ("Case Study Listing Section"): sub_heading, heading, short_text,
// CTA button, and the latest 3 case studies (newest first, same language) as listing cards
// (ui/CaseCard) in a Swiper slider. Desktop (lg+) shows all 3 side by side at the listing grid's
// card width, so the arrows/progress rail only appear on smaller screens where cards peek.

"use client";

import React from "react";
import { motion } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { DEFAULT_LANG } from "@/config";
import CtaButton from "@/components/ui/CtaButton";
import CaseCard from "@/components/ui/CaseCard";
import { toHtml } from "@/lib/content";
import { postStrings } from "@/lib/postStrings";

const AUTOPLAY_DELAY = 5000;
const MAX_CASES = 3;

// Newest first; the REST list is already date-desc, sort defensively when every item has a date
function latestCases(list) {
  const cases = Array.isArray(list) ? list : [];
  const dated = cases.every((c) => !Number.isNaN(Date.parse(c?.date)));
  const sorted = dated ? [...cases].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)) : cases;
  return sorted.slice(0, MAX_CASES);
}

export default function HomeCaseStudies({ data, lang = DEFAULT_LANG, prefetchedCases }) {
  const cases = latestCases(prefetchedCases);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(cases.length);

  const bgImage = data?.bg_image?.url || "";
  const { sub_heading, heading, short_text, cta_text, cta_url, read_more_text } =
    data || {};
  const readMore = read_more_text || postStrings(lang).readFullCase;

  if (!cases.length) return null;

  // Rail segments follow Swiper's real snap positions (with 2.1 slides visible the last two share one)
  const sync = (s) => {
    setActiveIndex(s.snapIndex);
    setSnapCount(s.snapGrid.length);
  };

  return (
    <>
      <div id="next"></div>
      <section id="case-section" className="py-15 md:py-30 relative overflow-hidden bg-(--color-light-grey)">
        {bgImage ? (
          <div className="absolute inset-0 -z-2" style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: '65% 0%', backgroundRepeat: 'no-repeat', backgroundSize: 'auto' }} suppressHydrationWarning />
        ) : null}

        <div className="w-full px-6 web-width">
          {/* SUB HEADING */}
          {sub_heading && (
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="h-2 w-2 rounded-full bg-(--color-yellow)"></span>
              <span className="subheading-label">{sub_heading}</span>
            </motion.div>
          )}

          {/* TOP HEADING + SHORT TEXT + CTA */}
          <div className="md:flex md:justify-between items-end mb-10 lg:mb-14">
            <motion.div
              className="mb-4 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            >
              {heading && (
                <div className="section-heading" dangerouslySetInnerHTML={{ __html: heading }} />
              )}
              {short_text && (
                <div
                  className="cs-p2 cs-rich max-w-[680px] mt-4 text-(--color-grey-dark)"
                  dangerouslySetInnerHTML={{ __html: toHtml(short_text) }}
                />
              )}
            </motion.div>

            {cta_text && cta_url && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>

          {/* SLIDER — same card width as the listing grid (3 columns, 24px gap) on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: ".case-next-btn",
                prevEl: ".case-prev-btn",
              }}
              onSwiper={sync}
              onSlideChange={sync}
              onResize={sync}
              onBreakpoint={sync}
              slidesPerView={1.1}
              spaceBetween={16}
              breakpoints={{
                768: { slidesPerView: 2.1, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 24 },
              }}
            >
              {cases.map((item, i) => (
                <SwiperSlide key={item.id} className="!h-auto">
                  <CaseCard
                    item={item}
                    lang={lang}
                    readMore={readMore}
                    index={i}
                    reveal={false}
                    className="h-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>

        {/* Controls: hidden on desktop (all 3 cards visible) and whenever nothing can scroll.
            Kept mounted (CSS-hidden) so Swiper's navigation keeps its button elements across resizes. */}
        {cases.length > 1 && (
          <div className={`lg:hidden ${snapCount > 1 ? "" : "hidden"}`}>
            {/* PROGRESS RAIL */}
            <div className="flex justify-center gap-2 mt-10 web-width px-6">
              {Array.from({ length: snapCount }, (_, i) => (
                <div
                  key={i}
                  className="case-progress-track flex-1 max-w-40 h-[3px] rounded-full bg-(--color-grey)/25 overflow-hidden"
                >
                  <span
                    key={i === activeIndex ? `${i}-active` : i}
                    className="case-progress-fill block h-full bg-(--color-black)"
                    style={{
                      width: i < activeIndex ? "100%" : i === activeIndex ? undefined : "0%",
                      animation:
                        i === activeIndex
                          ? `case-progress-fill ${AUTOPLAY_DELAY}ms linear forwards`
                          : "none",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* NAV BUTTONS */}
            <div className="flex justify-center gap-4 mt-6">
              <button type="button" aria-label="Previous" className="cursor-pointer case-prev-btn w-12 h-12 rounded-md border border-(--color-grey-medium) group flex items-center justify-center hover:bg-(--color-grey) transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12.532 12.403" className="transition-colors duration-300" aria-hidden>
                  <path d="M248.292,12.738h10.661a.338.338,0,1,1,0,.675H248.292l5.162,5.161a.338.338,0,1,1-.478.478L247,13.075,252.976,7.1a.338.338,0,1,1,.478.478Z" transform="translate(-246.859 -6.874)" className="fill-(--color-grey) stroke-(--color-grey) group-hover:fill-white group-hover:stroke-white" strokeWidth="0.2" fillRule="evenodd"/>
                </svg>
              </button>

              <button type="button" aria-label="Next" className="cursor-pointer case-next-btn w-12 h-12 rounded-md border border-(--color-grey-medium) group flex items-center justify-center hover:bg-(--color-grey) transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12.532 12.403" className="transition-colors duration-300" aria-hidden>
                  <path d="M258,12.738H247.338a.338.338,0,1,0,0,.675H258l-5.162,5.161a.338.338,0,0,0,.478.478l5.976-5.977L253.314,7.1a.338.338,0,0,0-.478.478Z" transform="translate(-246.9 -6.874)" className="fill-(--color-grey) stroke-(--color-grey) group-hover:fill-white group-hover:stroke-white" strokeWidth="0.2" fillRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
