// src/components/sections/product/ProductTestimonials.jsx
// "Full width Slider" testimonial layout (slider_type = fullwidth, see TestimonialSlider):
// full-width photo per slide with a black → transparent gradient, optional heading,
// italic quote, name/company with a yellow bar, arrows, "01 / 04" counter, dash
// indicators and an optional CTA button.
// Slides come from the "casestudies" CPT (lib/caseStudies mapTwinCases, newest first):
// banner_image (fallback: featured image) → background, ACF testimonial → quote,
// person_name, designation. The section's own bg_image is used when a case has no image.
// All quotes share one grid cell, so the section keeps the height of the longest one
// instead of jumping between slides.
// Mobile (< 768, Figma Product "Customer testimonial — Mobile"): padding 160 top / 48 bottom,
// gradient black → black 50%, quote Bold Italic 26/28 white, name 20/24, company Medium 16/20,
// one controls row (arrows 30 apart left, counter + dashes right).

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import SliderArrows from "@/components/ui/SliderArrows";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { curlyQuote, mediaUrl, toHtml } from "@/lib/content";

const pad = (n) => String(n).padStart(2, "0");
const MAX_CASES = 6;

// case study → slide. Background: the wide banner_image when set — the featured image is a
// 426×700 card crop and looks soft when stretched full width.
const caseToSlide = (c) => ({
  bg: c.bannerImage?.url || c.image?.url || "",
  quote: c.quote,
  name: c.personName,
  company: c.designation,
  logo: c.logo,
});

export default function ProductTestimonials({ data, lang = DEFAULT_LANG, cases = [] }) {
  const slides = (Array.isArray(cases) ? cases : []).filter((c) => c.quote).slice(0, MAX_CASES).map(caseToSlide);
  const [index, setIndex] = React.useState(0);
  const { heading, cta_text, cta_url } = data || {};
  if (slides.length === 0) return null;

  const bg = slides[index].bg || mediaUrl(data?.bg_image);
  const hasCta = cta_text && cta_url;

  return (
    <section className="relative isolate overflow-hidden bg-black" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      <AnimatePresence initial={false}>
        {bg && (
          <motion.div
            key={bg}
            className="absolute inset-0 -z-10"
            // cross-fade + slow settle from a slight zoom on each slide
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1, transition: { opacity: { duration: 0.6 }, scale: { duration: 6, ease: "easeOut" } } }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
          >
            <Image src={bg} alt="" fill sizes="100vw" className="object-cover object-top" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black to-transparent max-md:to-black/50" aria-hidden />

      <div className="cs-container py-16 lg:py-36 max-md:pt-40 max-md:pb-12">
        <Reveal className="flex flex-col items-start gap-12 lg:gap-16">
          {heading && (
            <h2 className="cs-h3 cs-title cs-highlight cs-rich max-w-[660px] font-extrabold text-(--color-light-grey)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
          )}

          {/* every quote is rendered in the same cell; only the active one is visible */}
          <div className="grid w-full max-w-[750px]">
            {slides.map((slide, i) => {
              const active = i === index;
              return (
                <motion.figure
                  key={i}
                  initial={false}
                  animate={{ opacity: active ? 1 : 0, y: active ? 0 : 12 }}
                  transition={{ duration: 0.35, delay: active ? 0.15 : 0 }}
                  aria-hidden={!active || undefined}
                  className={`flex flex-col justify-end gap-6 text-(--color-light-grey) [grid-area:1/1] ${active ? "" : "pointer-events-none"}`}
                >
                  {slide.logo?.url && (
                    <Image src={slide.logo.url} alt={slide.logo.alt || slide.name || ""} width={slide.logo.width || 155} height={slide.logo.height || 48} className="h-10 w-auto max-w-[155px] object-contain object-left lg:h-12" />
                  )}
                  <blockquote
                    className="font-bold text-[28px] leading-9 max-md:text-[26px] max-md:leading-7 max-md:text-[#FFFFFF] md:text-[36px] md:leading-[46px] xl:text-[42px] xl:leading-[52px]"
                    dangerouslySetInnerHTML={{ __html: toHtml(curlyQuote(slide.quote)) }}
                  />
                  {(slide.name || slide.company) && (
                    <figcaption className="flex items-center gap-3">
                      <span className="h-12 w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow) max-md:rounded-[8px]" aria-hidden />
                      <span className="flex flex-col gap-1">
                        {slide.name && <span className="font-bold text-[20px] lg:text-[24px] leading-7 tracking-[-0.48px] max-md:leading-6 max-md:tracking-[-0.4px]">{slide.name}</span>}
                        {slide.company && <span className="font-medium text-[16px] lg:text-[18px] leading-6 tracking-[0.15px] max-md:leading-5 max-md:tracking-normal">{slide.company}</span>}
                      </span>
                    </figcaption>
                  )}
                </motion.figure>
              );
            })}
          </div>

          {(slides.length > 1 || hasCta) && (
            <div className="flex w-full flex-wrap items-center justify-between gap-8">
              {slides.length > 1 && (
                <div className="flex flex-wrap items-center gap-8 lg:gap-12 max-md:w-full max-md:justify-between max-md:gap-x-0">
                  <SliderArrows index={index} count={slides.length} onChange={setIndex} className="max-md:gap-[30px]" />
                  <div className="flex items-center gap-4 text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--color-light-grey) max-md:flex-col max-md:items-start max-md:gap-[10px]">
                    <span aria-live="polite">
                      {pad(index + 1)} / {pad(slides.length)}
                    </span>
                    <div className="flex items-center gap-2" aria-hidden>
                      {slides.map((_, i) => (
                        <span
                          key={i}
                          className={`h-[3px] rounded-[2px] transition-all duration-300 ${i === index ? "w-9 bg-(--color-yellow) max-md:w-[34px]" : "w-6 bg-(--color-light-grey) max-md:w-[23px]"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {hasCta && (
                <CtaButton variant="outline-light-yellow" href={langHref(cta_url.trim(), lang)}>
                  {cta_text}
                </CtaButton>
              )}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
