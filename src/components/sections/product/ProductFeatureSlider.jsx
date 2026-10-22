// src/components/sections/product/ProductFeatureSlider.jsx
// ACF layout: feature_slider_section — "A smarter POS means more orders".
// Each slide: heading, text, checklist, CTA and a device screenshot shown in full
// on the right. Arrows centred under the slide.
// The screenshot is scroll-linked: it slides in from the right as the section scrolls
// into view, holds while it is in focus, and slides back out as you scroll past
// (reverses when scrolling up).

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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

  const sectionRef = React.useRef(null);
  const reduce = useReducedMotion();
  // 0 = section top hits the viewport bottom, 1 = section bottom leaves the viewport top
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imageX = useTransform(scrollYProgress, [0.1, 0.4, 0.65, 0.95], reduce ? ["0%", "0%", "0%", "0%"] : ["110%", "0%", "0%", "110%"]);
  const imageOpacity = useTransform(scrollYProgress, [0.1, 0.35, 0.7, 0.95], [0, 1, 1, 0]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const image = slide.image;

  return (
    <section ref={sectionRef} className="overflow-hidden py-18 lg:py-36" style={sectionBackground(data, { backgroundImage: GRADIENT })}>
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
            <div className="flex flex-col items-start gap-10 lg:max-w-[488px] lg:shrink-0">
              <div className="flex flex-col gap-5">
                <h2 className="cs-h3 cs-highlight font-extrabold text-black" dangerouslySetInnerHTML={{ __html: toHtml(slide.heading) }} />
                {slide.short_text && <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(slide.short_text) }} />}
                <CheckList items={slide.checklist} />
              </div>
              {slide.cta_text && slide.cta_url && <CtaButton href={langHref(slide.cta_url.trim(), lang)}>{slide.cta_text}</CtaButton>}
            </div>

            {mediaUrl(image) && (
              // Figma "coursing1": a 523×400 box 955px from the content edge (x 1075 at 1512),
              // 11px above the text column, bleeding past the viewport (section clips it).
              // Outer: scroll-linked slide in/out. Inner: slides in on every slide change.
              <motion.div style={{ x: imageX, opacity: imageOpacity }} className="flex w-full justify-center lg:absolute lg:left-[955px] lg:top-[-11px] lg:w-[523px]">
                <motion.div
                  className="relative aspect-[523/400] w-full max-w-[640px] lg:w-[523px] lg:max-w-none"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={mediaUrl(image)}
                    alt={image?.alt || ""}
                    fill
                    sizes="(min-width: 1024px) 523px, 100vw"
                    className="object-contain object-left"
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <SliderArrows index={index} count={slides.length} onChange={setIndex} />
      </Reveal>
    </section>
  );
}
