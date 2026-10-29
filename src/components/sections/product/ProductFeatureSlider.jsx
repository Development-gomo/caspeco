// src/components/sections/product/ProductFeatureSlider.jsx
// ACF layout: feature_slider_section — "A smarter POS means more orders".
// Each slide: heading, text, checklist, CTA and a device screenshot shown in full
// on the right. Arrows centred under the slide.
// The screenshot is scroll-linked on tablet/desktop (mobile: static, no scroll animation): it slides in from the right as the section scrolls
// into view, holds while it is in focus, and slides back out as you scroll past
// (reverses when scrolling up).
// Mobile (< 768, Figma Product "GOMO company size mobile" 2517:6670): solid #F4F5F5, padding 64,
// image full container width first (static, no scroll animation), then text, full-width CTA (label may wrap), checklist 12 apart,
// arrows 48px / 19.2 apart centred 48 below.

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
  const customBg = data?.bg_color || mediaUrl(data?.bg_image);

  return (
    <section ref={sectionRef} className={`overflow-hidden py-18 lg:py-36 max-md:py-16 ${customBg ? "" : "max-md:bg-none! max-md:bg-[#F4F5F5]!"}`} style={sectionBackground(data, { backgroundImage: GRADIENT })}>
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
            <div className="flex flex-col items-start gap-10 max-md:gap-6 lg:max-w-[488px] lg:shrink-0">
              <div className="flex flex-col gap-5 max-md:gap-4">
                <h2 className="cs-h3 cs-title cs-highlight font-extrabold text-black" dangerouslySetInnerHTML={{ __html: toHtml(slide.heading) }} />
                {slide.short_text && <div className="cs-p2 cs-rich text-(--color-grey-dark) max-md:font-light" dangerouslySetInnerHTML={{ __html: toHtml(slide.short_text) }} />}
                {/* Figma mobile "Benefits": 12 apart, X-Bold 18 / auto (22), no tracking, #171717 */}
                <CheckList items={slide.checklist} className="max-md:gap-3 max-md:[&>li]:leading-[22px] max-md:[&>li]:tracking-normal max-md:[&>li]:text-[#171717]" />
              </div>
              {slide.cta_text && slide.cta_url && (
                // Mobile: full width, label may wrap (Figma 342×68 for two lines: 11 + 2×22 + 13)
                <CtaButton
                  href={langHref(slide.cta_url.trim(), lang)}
                  className="max-md:w-full max-md:whitespace-normal max-md:text-center max-md:pt-[11px]! max-md:pb-[13px]! max-md:leading-[22px]!"
                >
                  {slide.cta_text}
                </CtaButton>
              )}
            </div>

            {mediaUrl(image) && (
              // Figma "coursing1": a 523×400 box 955px from the content edge (x 1075 at 1512),
              // 11px above the text column, bleeding past the viewport (section clips it).
              // Outer: scroll-linked slide in/out. Inner: slides in on every slide change.
              <motion.div style={{ x: imageX, opacity: imageOpacity }} className="flex w-full justify-center max-md:order-first max-md:transform-none! max-md:opacity-100! lg:absolute lg:left-[955px] lg:top-[-11px] lg:w-[523px]">
                <motion.div
                  className="relative aspect-[523/400] w-full max-w-[640px] max-md:aspect-[var(--img-ratio,523/400)] max-md:max-w-none lg:w-[523px] lg:max-w-none"
                  style={Number(image?.width) > 0 && Number(image?.height) > 0 ? { "--img-ratio": `${image.width} / ${image.height}` } : undefined}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={mediaUrl(image)}
                    alt={image?.alt || ""}
                    fill
                    sizes="(min-width: 1024px) 523px, 100vw"
                    className="object-contain object-left max-md:object-center"
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <SliderArrows index={index} count={slides.length} onChange={setIndex} className="max-md:gap-[19.2px]" />
      </Reveal>
    </section>
  );
}
