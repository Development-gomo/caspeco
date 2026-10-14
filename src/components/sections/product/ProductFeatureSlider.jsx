// src/components/sections/product/ProductFeatureSlider.jsx
// ACF layout: feature_slider_section — "A smarter POS means more orders".
// Each slide: heading, text, checklist, CTA and a device screenshot that bleeds
// off the right edge on desktop. Arrows centred under the slide.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import SliderArrows from "@/components/ui/SliderArrows";
import CheckList from "./CheckList";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const GRADIENT = "linear-gradient(180deg, rgba(218,220,221,0.8) 0.94%, rgba(255,255,255,0.5) 100.94%)";

export default function ProductFeatureSlider({ data, lang = DEFAULT_LANG }) {
  const slides = rows(data?.slides).filter((s) => s.heading);
  const [index, setIndex] = React.useState(0);
  if (slides.length === 0) return null;

  const slide = slides[index];
  const image = slide.image;

  return (
    <section className="overflow-hidden py-18 lg:py-36" style={sectionBackground(data, { backgroundImage: GRADIENT })}>
      <Reveal className="cs-container flex flex-col items-center gap-12 lg:gap-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="relative flex w-full flex-col gap-12 lg:flex-row lg:items-center xl:min-h-[400px]"
          >
            <div className="flex flex-col items-start gap-10 lg:max-w-[488px]">
              <div className="flex flex-col gap-5">
                <h2 className="cs-h3 cs-highlight font-extrabold text-black" dangerouslySetInnerHTML={{ __html: toHtml(slide.heading) }} />
                {slide.short_text && <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(slide.short_text) }} />}
                <CheckList items={slide.checklist} />
              </div>
              {slide.cta_text && slide.cta_url && <CtaButton href={langHref(slide.cta_url.trim(), lang)}>{slide.cta_text}</CtaButton>}
            </div>

            {mediaUrl(image) && (
              // Figma: 522×400 screenshot starting at x=954 of the 1512 frame, cut off by the viewport;
              // slides in from the right edge on every slide change
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[522/400] w-full max-w-[522px] self-center shadow-[0px_3.5px_10.5px_rgba(0,0,0,0.25)] lg:flex-1 xl:absolute xl:top-1/2 xl:left-[835px] xl:w-[522px] xl:-translate-y-1/2">
                <Image src={mediaUrl(image)} alt={image?.alt || ""} fill sizes="(min-width: 1024px) 522px, 100vw" className="object-cover object-left" />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <SliderArrows index={index} count={slides.length} onChange={setIndex} />
      </Reveal>
    </section>
  );
}
