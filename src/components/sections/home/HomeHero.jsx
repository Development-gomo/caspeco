"use client";

import Image from "next/image";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import HeroLabels from "@/components/ui/HeroLabels";
import { DEFAULT_LANG } from "@/config";

export default function HomeHero({ data, lang = DEFAULT_LANG }) {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-2%", "0%"]);

  const bgImage = data?.bg_image?.url || "";
  const bgVideo = data?.bg_video?.url || "";

  const heading = data?.heading || "";
  const shortHeading = data?.short_heading || "";

  const primaryCtaText = data?.cta_text || "";
  const primaryCtaUrl = data?.cta_url || "";
  const secondaryCtaText = data?.secondary_cta_text || "";
  const secondaryCtaUrl = data?.secondary_cta_url || "";

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden hero xl:min-h-240 max-md:min-h-[672px]"
    >
      {/* BG IMAGE/VIDEO */}
      <motion.div className="absolute hero-bg inset-0 -z-10" style={{ y: bgY }}>
        {bgVideo ? (
          <video
            src={bgVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : bgImage ? (
          <Image
            src={bgImage}
            alt=""
            fill
            priority
            className="object-cover object-top -top-[123px]"
          />
        ) : null}
      </motion.div>
      {/* <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/65 to-transparent -z-10"></div> */}
      {/* Mobile only — Figma Home "Hero section" fill: linear #000 70% → 0% top to bottom at 40% layer opacity */}
      <div className="absolute inset-0 -z-10 md:hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.28)_0%,rgba(0,0,0,0)_100%)]" aria-hidden />


      {/* HERO CONTENT — USP row pinned near the top, heading block pinned to the bottom */}
      {/* Mobile (Figma Home "Hero section" 2517:4784): 600px below the 72px fixed header, labels 16px
          under it (88 from the top), heading block bottom-aligned 64px above the hero's bottom edge */}
      <div className="cs-container relative z-10 min-h-screen flex flex-col justify-around lg:justify-between pt-24 pb-24 lg:pt-[148px] lg:pb-36 sm:gap-10 md:gap-20 lg:gap-24 xl:gap-[218px] max-md:min-h-[672px] max-md:justify-between max-md:gap-10 max-md:pt-[88px] max-md:pb-16">
        {/* "One platform / One partner / One login" — ACF label repeater, defaults when empty */}
        <HeroLabels labels={data?.label} lang={lang} className="mb-6 max-md:mb-0" />

        <div className="flex flex-col items-start gap-8 lg:gap-12 w-full max-md:gap-6">
          <div className="flex flex-col items-start gap-6 lg:gap-8 w-full text-white max-md:gap-4 max-md:text-(--color-light-grey)">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full normal-case text-[40px] leading-11 tracking-[-1.6px]
                max-md:text-[48px] max-md:leading-12 max-md:tracking-[-1.92px]
                md:text-[64px] md:leading-16 md:tracking-[-2.4px]
                lg:text-[72px] lg:leading-[72px] lg:tracking-[-2.8px]
                xl:text-[96px] xl:leading-[92px] xl:tracking-[-3.84px]
                min-[90rem]:text-[112px] min-[90rem]:leading-[104px] min-[90rem]:tracking-[-4.48px]"
              dangerouslySetInnerHTML={{ __html: heading }}
            />

            {shortHeading && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="lg:max-w-[850px] font-medium text-base leading-[22px] lg:text-[24px] lg:leading-7 lg:tracking-[-0.48px] max-md:text-[18px] max-md:tracking-[-0.36px] max-md:text-(--color-grey-medium)"
                dangerouslySetInnerHTML={{ __html: shortHeading }}
              />
            )}
          </div>

          {/* CTAs */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-wrap items-center gap-6">
              {primaryCtaText && primaryCtaUrl && (
                <CtaButton href={primaryCtaUrl}>{primaryCtaText}</CtaButton>
              )}

              {secondaryCtaText && secondaryCtaUrl && (
                // Figma hero "Light / Secondary" button, 24px right of the primary
                <CtaButton variant="outline-light-gold" href={secondaryCtaUrl}>
                  {secondaryCtaText}
                </CtaButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
