"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import ArrowSvg from "../../../../public/right-arrow.svg";
import { DEFAULT_LANG, langHref } from "@/config";

const STEP_COLORS = ["--color-navy", "--color-teracotta", "--color-mint"];

export default function HomeColumnSection({ data, lang = DEFAULT_LANG }) {
  const { sub_heading, heading, short_text, cta_text, cta_url } = data || {};
  const columns_side = data?.columns_side || [];

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (columns_side.length < 2) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % columns_side.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [columns_side.length]);

  if (!data) return null;

  return (
    <section
      id="next"
      className="py-15 md:py-30 relative overflow-hidden bg-white"
    >
      <div className="w-full px-6 web-width">
        <div className="lg:flex lg:items-start lg:gap-20">
          {/* COLUMN 1 — LABEL + HEADING + SHORT TEXT + CTA */}
          <div className="lg:w-[45%] lg:shrink-0 mb-12 lg:mb-0">
            {sub_heading && (
              <motion.p
                className="subheading-label text-(--color-teracotta)! mb-2 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {sub_heading}
              </motion.p>
            )}

            <motion.div
              className="section-heading mb-4 md:mb-6"
              dangerouslySetInnerHTML={{ __html: heading }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            />

            {short_text && (
              <motion.div
                className="body-text max-w-[420px]"
                dangerouslySetInnerHTML={{ __html: short_text }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              />
            )}

            {cta_text && cta_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: columns_side.length * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                <Link
                  href={langHref(cta_url, lang)}
                  className="gap-3 group relative inline-flex items-center rounded-sm bg-(--color-brand) px-6 py-4 text-white transition-all duration-300 hover:bg-(--color-brand) w-[235px] overflow-hidden select-none mt-8 md:mt-10"
                >
                  <span className="relative w-6 flex items-center justify-center">
                    <span className="absolute h-2 w-2 rounded-full bg-(--color-mint) transition-all duration-300 ease-out group-hover:opacity-0 group-hover:-translate-x-1"></span>
                  </span>
                  <span className="flex-1 text-[16px] leading-none transition-all duration-300 ease-out group-hover:-translate-x-4 whitespace-nowrap">
                    {cta_text}
                  </span>
                  <span className="relative w-4 flex items-center justify-center">
                    <span className="w-4 absolute opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:-translate-x-2">
                      <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* COLUMN 2 — STEPS, AUTO-CYCLING PULSE */}
          {columns_side.length > 0 && (
            <div className="relative flex-1 flex flex-col divide-y divide-(--color-warm-stand)">
              {/* Connecting timeline */}
              <div className="step-connector-line hidden md:block" />

              {columns_side.map((col, idx) => {
                const color = `var(${STEP_COLORS[idx % STEP_COLORS.length]})`;
                const isActive = idx === activeIndex;
                return (
                  <motion.div
                    key={idx}
                    className={`step-row flex items-center gap-6 py-6 px-4 -mx-4 first:pt-0 rounded-lg transition-colors duration-500 ${
                      isActive ? "bg-(--color-warm-stone)" : "bg-transparent"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="step-pulse-wrap relative shrink-0" style={{ "--step-color": color }}>
                      {isActive && (
                        <>
                          <span className="step-pulse-ring" />
                          <span className="step-pulse-ring step-pulse-ring-delay" />
                        </>
                      )}
                      <div className="step-icon" style={{ backgroundColor: color }}>
                        <span className="text-white text-[18px]"><Image src={ArrowSvg} width={13} height={13} alt="arrow" /></span>
                      </div>
                    </div>

                    <div>
                      <span className="step-number block mb-1" style={{ color }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      {col?.heading && (
                        <h3
                          className="step-heading mb-1"
                          style={{ "--step-accent": color }}
                          dangerouslySetInnerHTML={{ __html: col.heading }}
                        />
                      )}

                      {col?.short_text && (
                        <div
                          className="body-text"
                          dangerouslySetInnerHTML={{ __html: col.short_text }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
