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

// Collage = the 4 image frames of the Figma component "Company size display" (612×413).
// Its two variants are two layouts of the same frames; switching tabs Smart-Animates
// between them (150 ms, ease-out): frames move/resize, frames the layout hides fade out.
// Tabs with 3–4 images use the "four" layout (Default), 1–2 images the "two" (Variant2).
const FRAMES = ["2597", "2599", "2598", "2596"];
const LAYOUTS = {
  four: {
    order: ["2597", "2599", "2598", "2596"], // which frame gets images[0], images[1], …
    frames: {
      2597: { left: 78, top: 68, w: 258, h: 187, z: 3 },
      2599: { left: 342, top: 47, w: 204, h: 208, z: 4 },
      2598: { left: 119, top: 261, w: 140, h: 122, z: 2 },
      2596: { left: 269, top: 261, w: 245, h: 152, z: 1 },
    },
  },
  two: {
    order: ["2596", "2598"],
    frames: {
      2596: { left: 80, top: 55, w: 318, h: 333, z: 1 },
      2598: { left: 370, top: 111, w: 242, h: 230, z: 2 },
      2597: { left: 96, top: 174, w: 272, h: 272, z: 0 }, // hidden in this layout
      2599: { left: 297, top: 0, w: 142, h: 142, z: 0 }, // hidden in this layout
    },
  },
};
const TRANSITION = { duration: 0.15, ease: "easeOut" }; // Figma: Smart Animate, 150 ms, ease-out
const pct = (v, total) => `${(v / total) * 100}%`;

function Collage({ images }) {
  const layout = LAYOUTS[images.length > 2 ? "four" : "two"];
  const assigned = Object.fromEntries(layout.order.map((frame, i) => [frame, images[i]]));

  // A frame that fades out keeps showing its last image instead of going blank
  // (state updated during render — React's pattern for values derived from previous props)
  const [lastImage, setLastImage] = React.useState(assigned);
  if (FRAMES.some((f) => assigned[f] && assigned[f] !== lastImage[f])) {
    setLastImage((prev) => ({ ...prev, ...Object.fromEntries(FRAMES.filter((f) => assigned[f]).map((f) => [f, assigned[f]])) }));
  }

  return (
    <div className="relative w-full max-w-[612px] aspect-[612/413] shrink-0">
      {FRAMES.map((f) => {
        const s = layout.frames[f];
        const img = assigned[f] || lastImage[f];
        const src = img && mediaUrl(img);
        return (
          <motion.div
            key={f}
            className="absolute overflow-hidden rounded-[8px] bg-[#d9d9d9] shadow-[0px_8px_40px_8px_rgba(0,0,0,0.16)]"
            style={{ zIndex: s.z }}
            initial={false}
            animate={{
              left: pct(s.left, 612),
              top: pct(s.top, 413),
              width: pct(s.w, 612),
              height: pct(s.h, 413),
              opacity: assigned[f] ? 1 : 0,
            }}
            transition={TRANSITION}
            aria-hidden={!assigned[f] || undefined}
          >
            <AnimatePresence initial={false}>
              {src && (
                <motion.div key={src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION}>
                  <Image src={src} alt={assigned[f] ? img.alt || "" : ""} fill sizes="(min-width: 1024px) 320px, 50vw" className="object-cover" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
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
  // Keep the collage slot for every tab once any tab has images, so the layout doesn't jump
  const hasCollage = tabs.some((t) => rows(t.images).length > 0);

  return (
    <section
      className="pt-18 pb-12 lg:pt-36 lg:pb-[72px]"
      style={sectionBackground(data, { background: "var(--color-light-grey)" })}
    >
      <div className="cs-container flex flex-col items-center gap-8 lg:gap-[46px]">
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

            <div role="tabpanel" className="flex w-full flex-col items-center gap-10 lg:flex-row lg:justify-center xl:gap-[120px]">
              {/* stays mounted so its frames can animate from one tab's layout to the next */}
              {hasCollage && <Collage images={rows(tab.images)} />}

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={TRANSITION}
                  className="flex w-full max-w-[536px] flex-col items-start gap-10 xl:px-6"
                >
                  <div className="flex flex-col gap-5">
                    {tab.title && <h3 className="cs-h4 text-black">{tab.title}</h3>}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
