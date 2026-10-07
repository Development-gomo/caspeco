// src/components/sections/home/HomeHelpTabs.jsx
// ACF layout: home_tab_section — "How can we help you?" pill tabs, each with an
// image collage, title, text, checklist and CTA.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import CheckIcon from "../../../../public/icons/home/check.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// Collage slots from the Figma frame (612×408), as % so the collage scales down.
const SLOTS = [
  { left: 78, top: 68, w: 258, h: 187 },
  { left: 342, top: 47, w: 204, h: 208 },
  { left: 119, top: 261, w: 140, h: 122 },
  { left: 269, top: 261, w: 245, h: 152 },
];
const pct = (v, total) => `${(v / total) * 100}%`;

function Collage({ images }) {
  return (
    <div className="relative w-full max-w-[612px] aspect-[612/413] shrink-0">
      {images.slice(0, SLOTS.length).map((img, i) => {
        const s = SLOTS[i];
        return (
          <div
            key={img.id || i}
            className="absolute overflow-hidden rounded-[8px] bg-[#d9d9d9] shadow-[0px_8px_40px_8px_rgba(0,0,0,0.16)]"
            style={{ left: pct(s.left, 612), top: pct(s.top, 413), width: pct(s.w, 612), height: pct(s.h, 413) }}
          >
            <Image src={mediaUrl(img)} alt={img.alt || ""} fill sizes="(min-width: 1024px) 260px, 45vw" className="object-cover" />
          </div>
        );
      })}
    </div>
  );
}

export default function HomeHelpTabs({ data, lang = DEFAULT_LANG }) {
  const tabs = rows(data?.tabs).filter((t) => t.tab_label);
  const [active, setActive] = React.useState(0);
  if (!data?.heading && tabs.length === 0) return null;

  const tab = tabs[active];
  const checklist = rows(tab?.checklist).map((r) => r.item || r.text).filter(Boolean);
  const ctaText = tab?.cta_text;
  const ctaUrl = tab?.cta_url || data?.cta_url;

  return (
    <section
      className="pt-18 pb-12 lg:pt-36 lg:pb-[72px]"
      style={sectionBackground(data, { background: "var(--color-light-grey)" })}
    >
      <div className="cs-container flex flex-col items-center gap-8 lg:gap-[49px]">
        {data.heading && (
          <h2
            className="cs-h2 cs-highlight cs-rich text-center text-black"
            dangerouslySetInnerHTML={{ __html: toHtml(data.heading) }}
          />
        )}

        {tabs.length > 0 && (
          <div className="flex w-full flex-col items-center gap-8">
            {/* Pill tabs — scroll horizontally on small screens */}
            <div className="max-w-full overflow-x-auto px-1 py-2 [scrollbar-width:none]">
              <div role="tablist" className="flex w-max items-center gap-1 rounded-[56px] bg-white p-[5px] shadow-[0px_2px_4.5px_rgba(0,0,0,0.1)]">
                {tabs.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    onClick={() => setActive(i)}
                    className={`h-[39px] cursor-pointer whitespace-nowrap rounded-[50px] px-[14px] text-[16px] lg:text-[18px] leading-[22px] font-medium tracking-[-0.36px] transition-colors duration-300 ${
                      active === i
                        ? "bg-(--color-grey-dark) text-(--color-light-grey)"
                        : "bg-(--color-light-grey) text-(--color-grey-dark) hover:bg-(--color-grey-medium)"
                    }`}
                  >
                    {t.tab_label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                role="tabpanel"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="flex w-full flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-[120px]"
              >
                {rows(tab.images).length > 0 && <Collage images={rows(tab.images)} />}

                <div className="flex w-full max-w-[536px] flex-col items-start gap-10 lg:px-6">
                  <div className="flex flex-col gap-5">
                    {tab.title && <h3 className="cs-h4 text-(--color-black)">{tab.title}</h3>}
                    {tab.text && (
                      <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(tab.text) }} />
                    )}
                    {checklist.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {checklist.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 font-extrabold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-(--color-grey-dark)">
                            <Image src={CheckIcon} alt="" width={14} height={16} className="shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {ctaText && ctaUrl && (
                    <CtaButton variant="dark" href={langHref(ctaUrl, lang)} wrap className="max-w-full">
                      {ctaText}
                    </CtaButton>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
