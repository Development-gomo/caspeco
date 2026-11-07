// src/components/sections/inner-pages/InnerHero.jsx
// ACF layout: hero_section (Page Builder, inner pages). Same look as HomeHero: label row
// ("One platform / One partner / One login") pinned near the top, heading block pinned to the
// bottom, HomeHero type scale (up to 112/104) and the Medium 24/28 short text.
// Fields: sub_heading (italic eyebrow above the heading), heading, short_text, cta_text + cta_url (yellow button), bg_image,
// bg_video (optional ACF file; when set it replaces the image as the background and bg_image becomes its poster),
// background_color (used when there is no image), hero_height (25–100, % of the viewport), enable_overlay (button group "enable"/"disable"; dark overlay over bg_image).

"use client";

import Image from "next/image";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import HeroLabels from "@/components/ui/HeroLabels";
import { DEFAULT_LANG } from "@/config";
import { toHtml } from "@/lib/content";

export default function InnerHero({ data, lang = DEFAULT_LANG }) {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-2%", "0%"]);

  const bgImage = data?.bg_image?.url || "";
  const bgVideo = data?.bg_video?.url || "";
  // enable_overlay: ACF Button Group, may arrive as "enable" or { value: "enable" }
  const overlayField = data?.enable_overlay;
  const overlay = (overlayField?.value ?? overlayField) === "enable";
  const heading = data?.heading || "";
  const subHeading = data?.sub_heading || "";
  const shortText = data?.short_text || "";
  const ctaText = (data?.cta_text || "").trim();
  // editors already type site paths such as "/en/contact" — use the URL as entered (no langHref, it would double the prefix)
  const ctaUrl = (data?.cta_url || "").trim();
  // hero_height: % of the viewport (ACF default 100); full height also keeps HomeHero's xl minimum
  const height = Math.min(100, Math.max(25, Number(data?.hero_height) || 100));
  const full = height >= 100;

  return (
    <section
      ref={sectionRef}
      // isolate: own stacking context, so the -z-10 image paints above the section's background colour
      className={`relative isolate w-full overflow-hidden hero ${full ? "min-h-screen xl:min-h-200" : ""}`}
      style={{ backgroundColor: data?.background_color || "var(--color-black)", ...(full ? {} : { minHeight: `${height}vh` }) }}
    >
      {/* BG IMAGE — overlay on: the parallax lifts the image up to 2%, which would leave an image-less strip at the bottom under the static overlay (a grey band), so the image box is extended 3% below the section */}
      {(bgVideo || bgImage) && (
        <motion.div className="absolute hero-bg inset-0 -z-10" style={overlay ? { y: bgY, bottom: "-3%" } : { y: bgY }}>
          {bgVideo ? (
            // bg_video (same as HomeHero): muted looping autoplay; bg_image doubles as the poster
            <video
              src={bgVideo}
              poster={bgImage || undefined}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <Image src={bgImage} alt="" fill priority className="object-cover object-top" />
          )}
        </motion.div>
      )}
      {/* OVERLAY — static, so it covers the whole section while the image parallaxes */}
      {(bgVideo || bgImage) && overlay && <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />}

      {/* HERO CONTENT — USP row pinned near the top, heading block pinned to the bottom */}
      <div
        className={`cs-container relative z-10 flex flex-col justify-between gap-10 pt-24 pb-24 lg:pt-[148px] lg:pb-36 ${full ? "min-h-screen" : ""}`}
        style={full ? undefined : { minHeight: `${height}vh` }}
      >
        <HeroLabels labels={data?.label} lang={lang} className="mb-6" />

        <div className="flex w-full flex-col items-start gap-6 text-white lg:gap-8">
          {subHeading && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="italic text-[20px] leading-6 tracking-[-0.4px] lg:text-[24px] lg:leading-7 lg:tracking-[-0.48px]"
              dangerouslySetInnerHTML={{ __html: subHeading }}
            />
          )}

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full normal-case text-[40px] leading-11 tracking-[-1.6px]
              md:text-[64px] md:leading-16 md:tracking-[-2.4px]
              lg:text-[72px] lg:leading-[72px] lg:tracking-[-2.8px]
              xl:text-[96px] xl:leading-[92px] xl:tracking-[-3.84px]
              min-[90rem]:text-[112px] min-[90rem]:leading-[104px] min-[90rem]:tracking-[-4.48px]"
            dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
          />

          {shortText && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="cs-rich font-medium text-base leading-[22px] lg:max-w-[850px] lg:text-[24px] lg:leading-7 lg:tracking-[-0.48px]"
              dangerouslySetInnerHTML={{ __html: toHtml(shortText) }}
            />
          )}

          {ctaText && ctaUrl && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <CtaButton href={ctaUrl}>{ctaText}</CtaButton>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
