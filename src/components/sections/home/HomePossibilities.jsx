// src/components/sections/home/HomePossibilities.jsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DEFAULT_LANG, langHref } from "@/config";

// Colours taken from the reference design. Kept as CSS vars on the section so
// they can be swapped for site tokens in one place if the brand palette wins.
const SECTION_VARS = {
  "--pos-underline": "#F2B705",
  "--pos-button": "#1B6B68",
};

export default function HomePossibilities({ data, lang = DEFAULT_LANG }) {
  const { heading, tabs = [], cta_text, cta_url } = data || {};
  const [active, setActive] = useState(0);

  if (!tabs.length) return null;

  const activeTab = tabs[active] || tabs[0];
  // Textarea content arrives with \r\n — split on blank lines so multi-paragraph
  // copy still renders as separate paragraphs.
  const paragraphs = (activeTab?.short_text || "")
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .filter(Boolean);

  return (
    <section
      id="possibilities"
      style={SECTION_VARS}
      className="py-15 md:py-30 overflow-hidden"
    >
      <div className="web-width px-6">
        {/* HEADING — normal-case/font-semibold override the global uppercase h2 rule */}
        {heading && (
          <motion.h2
            className="normal-case font-semibold tracking-[-0.02em] text-(--color-navy) text-[clamp(2rem,5vw,4rem)] leading-[1.08] max-w-[1100px] mb-10 md:mb-20"
            dangerouslySetInnerHTML={{ __html: heading }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          />
        )}

        <div className="grid gap-10 lg:gap-14 lg:grid-cols-[minmax(180px,0.85fr)_minmax(0,2fr)_minmax(0,1.15fr)] lg:items-start">
          {/* ── TABS: horizontal scroller on mobile, vertical list on desktop ── */}
          <div
            role="tablist"
            aria-orientation="vertical"
            className="flex flex-row lg:flex-col gap-8 lg:gap-10 overflow-x-auto lg:overflow-visible -mx-6 px-6 lg:mx-0 lg:px-0 pb-1 lg:pb-0 scrollbar-hide"
          >
            {tabs.map((tab, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className="shrink-0 text-left cursor-pointer select-none group"
                >
                  <span
                    className={`block whitespace-nowrap text-[24px] lg:text-[30px] leading-none transition-colors duration-300 ${
                      isActive
                        ? "font-semibold text-(--color-navy)"
                        : "font-normal text-(--color-navy)/40 group-hover:text-(--color-navy)/70"
                    }`}
                  >
                    {tab.tab_title}
                  </span>

                  {/* Active underline */}
                  <span
                    className={`mt-3 lg:mt-4 block h-[4px] rounded-full bg-(--pos-underline) origin-left transition-all duration-300 ease-out ${
                      isActive ? "w-full opacity-100" : "w-0 opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* ── CONTENT + CTA ── */}
          <div className="lg:pt-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="max-w-[600px] space-y-5 text-(--color-navy) text-[18px] leading-[30px] md:text-[22px] md:leading-[38px]">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {cta_text && (
              <Link
                href={langHref(cta_url || "#", lang)}
                className="mt-8 md:mt-12 inline-flex items-center justify-center rounded-full bg-(--pos-button) px-9 py-4 md:py-5 text-white text-[16px] md:text-[18px] leading-none transition-opacity duration-300 hover:opacity-90 select-none"
              >
                {cta_text}
              </Link>
            )}
          </div>

          {/* ── IMAGE ── */}
          <div className="relative w-full">
            <AnimatePresence mode="wait">
              {activeTab?.image?.url && (
                <motion.div
                  key={activeTab.image.url + active}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <Image
                    src={activeTab.image.url}
                    alt={activeTab.image.alt || activeTab.tab_title || ""}
                    width={activeTab.image.width || 800}
                    height={activeTab.image.height || 600}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="h-auto w-full object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
