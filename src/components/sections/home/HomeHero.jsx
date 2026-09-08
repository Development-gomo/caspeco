"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ArrowSvg from "../../../../public/right-arrow.svg";

export default function HomeHero({ data }) {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);

  const bgImage = data?.bg_image?.url || "";
  const bgVideo = data?.bg_video?.url || "";

  const heading = data?.heading || "";
  const shortHeading = data?.short_heading || "";

  // TODO: no ACF fields exist yet for the eyebrow label or the two CTAs
  // shown in the new design — wire these to real fields once added.
  const label = data?.label || "";
  const primaryCtaText = data?.cta_text || "";
  const primaryCtaUrl = data?.cta_url || "";
  const secondaryCtaText = data?.secondary_cta_text || "";
  const secondaryCtaUrl = data?.secondary_cta_url || "";

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden hero">
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
      {/* Diagonal panel */}
      <div className="hero-diagonal-panel absolute bottom-0 left-0 w-full lg:w-full h-[62%] sm:h-[56%] lg:h-[66%] bg-(--color-warm-stone) shadow-2xl" />
      <div className="absolute inset-0 bg-linear-to-b from-(--color-warm-stone)/40 via-(--color-warm-stone)/65 to-transparent -z-10"></div>

      {/* HERO TEXT */}
      <div className="relative z-10 min-h-screen web-width px-6 lg:px-10 h-full flex flex-col items-start justify-center">
        <div className="max-w-[900px] pb-12 pt-12">
          {label && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="uppercase subheading-label text-(--color-teracotta)! mb-3"
            >
              {label}
            </motion.p>
          )}

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-panel-heading text-(--color-navy)"
            dangerouslySetInnerHTML={{ __html: heading }}
          />

          {shortHeading && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hero-panel-subtext body-text max-w-[360px] mt-4 text-(--color-navy)!"
              dangerouslySetInnerHTML={{ __html: shortHeading }}
            />
          )}

          {/* CTAs */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-wrap items-center gap-6 mt-8">
              {primaryCtaText && primaryCtaUrl && (
                <Link
                  href={primaryCtaUrl}
                  className="
                    gap-3 group relative inline-flex items-center
                    rounded-sm bg-(--color-brand) px-6 py-4 text-white
                    transition-all duration-300 hover:bg-(--color-brand)
                    w-[154px] overflow-hidden select-none">
                  {/* DOT */}
                  <span className="relative w-6 flex items-center justify-center">
                    <span
                      className="
                        absolute h-2 w-2 rounded-full bg-(--color-mint)
                        transition-all duration-300 ease-out
                        group-hover:opacity-0 group-hover:-translate-x-1
                      "
                    ></span>
                  </span>

                  {/* TEXT */}
                  <span
                    className="
                      flex-1 text-[16px] leading-none whitespace-nowrap
                      transition-all duration-300 ease-out
                      group-hover:-translate-x-3
                    "
                  >
                    {primaryCtaText}
                  </span>

                  {/* ARROW */}
                  <span className="relative w-4 flex items-center justify-center">
                    <span
                      className="
                        w-4 absolute opacity-0 -translate-x-4
                        transition-all duration-300 ease-out
                        group-hover:opacity-100 group-hover:-translate-x-1
                      "
                    >
                      <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                    </span>
                  </span>
                </Link>
              )}

              {secondaryCtaText && secondaryCtaUrl && (
                <Link
                  href={secondaryCtaUrl}
                  className="group inline-flex items-center gap-2 text-[16px] text-(--color-navy) select-none"
                >
                  {secondaryCtaText}
                  <span className="text-(--color-accent) transition-transform duration-300 ease-out group-hover:translate-x-1">→</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about-section"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector("#about-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="hero-scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-(--color-navy)"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <span className="subheading-label text-(--color-navy)!">Scroll</span>
        <span className="hero-scroll-cue-arrow">↓</span>
      </motion.a>
    </section>
  );
}
