"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";

export default function HomeHero({ data }) {
  const sectionRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "0%"]);

  const bgImage = data?.bg_image?.url || "";
  const bgVideo = data?.bg_video?.url || "";

  const heading = data?.heading || "";
  const shortHeading = data?.short_heading || "";

  // "Label" is an ACF repeater (up to 3 rows) of { label, link } pairs —
  // the "One support / One partner / One log in" tag row in the Figma design.
  const labels = Array.isArray(data?.label)
    ? data.label.filter((row) => row?.label)
    : [];
  const primaryCtaText = data?.cta_text || "";
  const primaryCtaUrl = data?.cta_url || "";
  const secondaryCtaText = data?.secondary_cta_text || "";
  const secondaryCtaUrl = data?.secondary_cta_url || "";

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden hero lg:h-245"
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

      {/* HERO CONTENT — USP row pinned near the top, heading block pinned to the bottom */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between px-6 pt-24 pb-12 lg:px-[120px] lg:pt-[148px] lg:pb-36 gap-20">
        {labels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap items-center gap-4 lg:gap-8 text-white font-extrabold text-base lg:text-[20px] leading-[22px]"
          >
            {labels.map((row, i) =>
              row.link ? (
                <Link key={i} href={row.link} className="hover:underline">
                  {row.label}
                </Link>
              ) : (
                <span key={i}>{row.label}</span>
              ),
            )}
          </motion.div>
        )}

        <div className="flex flex-col items-start gap-8 lg:gap-12 w-full">
          <div className="flex flex-col items-start gap-6 lg:gap-8 w-full text-white">
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full text-[40px] leading-11 tracking-[-1.6px]
                md:text-[64px] md:leading-16 md:tracking-[-2.4px]
                lg:text-[88px] lg:leading-[84px] lg:tracking-[-3.2px]"
              dangerouslySetInnerHTML={{ __html: heading }}
            />

            {shortHeading && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="max-w-[650px] font-medium text-base leading-[22px] lg:text-[24px] lg:leading-7 lg:tracking-[-0.48px]"
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
                <Link
                  href={secondaryCtaUrl}
                  className="group inline-flex items-center gap-2 text-[16px] text-white select-none"
                >
                  {secondaryCtaText}
                  <span className="text-(--color-accent) transition-transform duration-300 ease-out group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
