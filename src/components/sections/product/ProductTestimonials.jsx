// src/components/sections/product/ProductTestimonials.jsx
// ACF layout: testimonial_slider_section — full-width photo per slide with a
// black → transparent gradient, italic quote, name/company with a yellow bar,
// arrows, "01 / 04" counter and dash indicators.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import SliderArrows from "@/components/ui/SliderArrows";
import { mediaUrl, rows, toHtml } from "@/lib/content";

const pad = (n) => String(n).padStart(2, "0");

export default function ProductTestimonials({ data }) {
  const slides = rows(data?.slides).filter((s) => s.quote);
  const [index, setIndex] = React.useState(0);
  if (slides.length === 0) return null;

  const slide = slides[index];
  const bg = mediaUrl(slide.bg_image) || mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black)">
      <AnimatePresence initial={false}>
        {bg && (
          <motion.div
            key={bg}
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image src={bg} alt="" fill sizes="100vw" className="object-cover object-top" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black to-transparent" aria-hidden />

      <div className="cs-container py-16 lg:py-[72px]">
        <div className="flex max-w-[750px] flex-col items-start gap-12 lg:gap-16">
          <AnimatePresence mode="wait">
            <motion.figure
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-6 text-(--color-light-grey)"
            >
              <blockquote
                className="italic font-bold text-[28px] leading-9 md:text-[36px] md:leading-[46px] xl:text-[42px] xl:leading-[52px]"
                dangerouslySetInnerHTML={{ __html: toHtml(slide.quote) }}
              />
              {(slide.name || slide.company) && (
                <figcaption className="flex items-center gap-3">
                  <span className="h-12 w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow)" aria-hidden />
                  <span className="flex flex-col">
                    {slide.name && <span className="font-bold text-[20px] lg:text-[24px] leading-7 tracking-[-0.48px]">{slide.name}</span>}
                    {slide.company && <span className="font-medium text-[16px] lg:text-[18px] leading-6 tracking-[0.15px]">{slide.company}</span>}
                  </span>
                </figcaption>
              )}
            </motion.figure>
          </AnimatePresence>

          {slides.length > 1 && (
            <div className="flex flex-wrap items-center gap-8 lg:gap-12">
              <SliderArrows index={index} count={slides.length} onChange={setIndex} />
              <div className="flex items-center gap-4 text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--color-light-grey)">
                <span aria-live="polite">
                  {pad(index + 1)} / {pad(slides.length)}
                </span>
                <div className="flex items-center gap-2" aria-hidden>
                  {slides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-[3px] rounded-[2px] transition-all duration-300 ${i === index ? "w-9 bg-(--color-yellow)" : "w-6 bg-(--color-light-grey)"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
