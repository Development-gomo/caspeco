// src/components/sections/product/ProductFeatureSlider.jsx
// ACF layout: feature_slider_section — "A smarter POS means more orders".
// Each slide: heading, text, checklist, CTA and a device screenshot shown in full
// on the right. Tablet/desktop: CTA under the checklist, arrows centred under the slide.
// The screenshot is scroll-linked on tablet/desktop (mobile: static, no scroll animation): it slides in from the right as the section scrolls
// into view, holds while it is in focus, and slides back out as you scroll past
// (reverses when scrolling up).
// Mobile (< 768, Figma 601:9645, 390 frame): solid #F4F5F5, padding 64/24, blocks 48 apart:
//   image 342×223 (full container width, cover, radius 4.56, two-layer shadow; static)
//   → text (title 36/102%, text Light 18/22, checklist 12 apart, 16 between)
//   → controls row: arrows 48px / 24 apart on the left; "01 / 04" counter (SemiBold 14/20, 0.1px)
//     with dash indicators 10 below it on the right (3px, 8 apart, active 34 yellow, others 23 #8F8D88)
//   → full-width outline CTA (2px #3F3E3C, Bold 16, 48 tall; label may wrap).
// The CTA is rendered twice (desktop one inside the text column, mobile one after the controls).

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
const pad = (n) => String(n).padStart(2, "0");

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
  const hasCta = slide.cta_text && slide.cta_url;
  const ctaHref = hasCta ? langHref(slide.cta_url.trim(), lang) : "";

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
              {hasCta && (
                // tablet/desktop CTA; mobile renders its own outline CTA after the controls row
                <CtaButton href={ctaHref} className="max-md:hidden">
                  {slide.cta_text}
                </CtaButton>
              )}
            </div>

            {mediaUrl(image) && (
              // Figma "coursing1": a 523×400 box 955px from the content edge (x 1075 at 1512),
              // 11px above the text column, bleeding past the viewport (section clips it).
              // Outer: scroll-linked slide in/out. Inner: slides in on every slide change.
              <motion.div style={{ x: imageX, opacity: imageOpacity }} className="flex w-full justify-center max-md:order-first max-md:transform-none! max-md:opacity-100! lg:absolute lg:left-[955px] lg:top-[-11px] lg:w-[523px]">
                {/* mobile: Figma 342×223 frame, radius 4.56, shadow 0 2.28 6.84 2.28 /15% + 0 1.14 2.28 /30% */}
                <motion.div
                  className="relative aspect-[523/400] w-full max-w-[640px] max-md:aspect-[342/223] max-md:max-w-none max-md:overflow-hidden max-md:rounded-[4.56px] max-md:shadow-[0_2.28px_6.84px_2.28px_rgba(0,0,0,0.15),0_1.14px_2.28px_rgba(0,0,0,0.3)] lg:w-[523px] lg:max-w-none"
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={mediaUrl(image)}
                    alt={image?.alt || ""}
                    fill
                    sizes="(min-width: 1024px) 523px, 100vw"
                    className="object-contain object-left max-md:object-cover max-md:object-center"
                  />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          // tablet/desktop: arrows centred. Mobile: full-width row, arrows left, counter + dashes right.
          <div className="flex items-center justify-center max-md:w-full max-md:justify-between">
            <SliderArrows index={index} count={slides.length} onChange={setIndex} className="max-md:gap-6" />
            <div className="flex flex-col items-start gap-[10px] md:hidden">
              <span aria-live="polite" className="font-[Roboto,var(--font-tenon),system-ui,sans-serif] text-[14px] font-semibold leading-5 tracking-[0.1px] text-(--color-grey-dark)">
                {pad(index + 1)} / {pad(slides.length)}
              </span>
              <div className="flex items-center gap-2" aria-hidden>
                {slides.map((_, i) => (
                  <span key={i} className={`h-[3px] rounded-[2px] transition-all duration-300 ${i === index ? "w-[34px] bg-(--color-yellow)" : "w-[23px] bg-[#8F8D88]"}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {hasCta && (
          // mobile only: Figma outline button 48 tall, 2px #3F3E3C, padding 38 (36 + 2 stroke via .cs-btn.border-2)
          <CtaButton variant="outline-dark" wrap href={ctaHref} className="md:hidden max-md:py-3!">
            {slide.cta_text}
          </CtaButton>
        )}
      </Reveal>
    </section>
  );
}
