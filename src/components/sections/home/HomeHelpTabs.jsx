// src/components/sections/home/HomeHelpTabs.jsx
// ACF layout: home_tab_section — "How can we help you?" pill tabs, each with an
// image collage, title, text, checklist and CTA.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import CheckIcon from "../../../../public/icons/home/check.svg";
import CheckYellow from "../../../../public/icons/home/check-yellow.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// Collage = the 4 image frames of the Figma component "Company size display" (612×408; one frame overhangs 5px at the bottom, as in Figma).
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
// Tab text: slower than the collage so it reads as a fade, not a blink
const TEXT_OUT = { duration: 0.2, ease: "easeIn" };
const TEXT_IN = { duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] };
const pct = (v, total) => `${(v / total) * 100}%`;

// Mobile (< 768) tab bar, Figma "Category navigation": the pill stays 345 wide and the tabs scroll
// sideways inside it; an 86px fade (#FDFDFD 0 → 1 at 28%) with an 8×14 chevron sits on the right
// edge while there is more to scroll. Also used by ProductSalesChannels.
export function MobileTabFade({ scrollerRef }) {
  const [more, setMore] = React.useState(false);
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [scrollerRef]);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 right-0 w-[86px] transition-opacity duration-200 md:hidden ${more ? "opacity-100" : "opacity-0"}`}
      style={{ background: "linear-gradient(90deg, rgba(253,253,253,0) 0%, #FDFDFD 28%)" }}
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" className="absolute top-1/2 right-5 -translate-y-1/2">
        <path
          d="M7.70709 6.29399C8.09764 6.68448 8.09764 7.31864 7.70709 7.70914L1.70826 13.7071C1.31771 14.0976 0.68346 14.0976 0.292912 13.7071C-0.0976372 13.3166 -0.0976372 12.6825 0.292912 12.292L5.58563 7L0.296036 1.70802C-0.0945128 1.31753 -0.0945128 0.683365 0.296036 0.292871C0.686585 -0.0976236 1.32084 -0.0976236 1.71138 0.292871L7.71021 6.29086L7.70709 6.29399Z"
          fill="#3F3E3C"
        />
      </svg>
    </div>
  );
}

// Mobile: bring a tapped tab fully into view inside the scrolling pill (no page scroll)
export function revealTab(button) {
  if (typeof window === "undefined" || !window.matchMedia("(max-width: 767.98px)").matches) return;
  const sc = button?.closest("[data-tab-scroller]");
  if (!sc) return;
  const b = button.getBoundingClientRect();
  const r = sc.getBoundingClientRect();
  const fade = 86; // keep the tab clear of the right-edge fade
  if (b.left < r.left) sc.scrollBy({ left: b.left - r.left - 5, behavior: "smooth" });
  else if (b.right > r.right - fade) sc.scrollBy({ left: b.right - (r.right - fade), behavior: "smooth" });
}

const escHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// plain-text titles with a question ("Opening soon? Start here.") get the part after it yellow on mobile
// (Figma: "Opening soon? " #FDFDFD + "Start here." #FFC120); titles that already contain markup are used as written
export function titleHtml(t) {
  if (!t) return "";
  if (/<[a-z]/i.test(t)) return t;
  const i = t.indexOf("? ");
  if (i < 0) return escHtml(t);
  return `${escHtml(t.slice(0, i + 2))}<span class="max-md:text-(--color-yellow)">${escHtml(t.slice(i + 2))}</span>`;
}

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
    // mobile: the first image fills the whole content panel as its background (Figma "Frame 8934403")
    <div className="relative w-full max-w-[612px] aspect-[612/408] shrink-0 max-md:absolute max-md:inset-0 max-md:z-0 max-md:aspect-auto max-md:max-w-none">
      {FRAMES.map((f) => {
        const s = layout.frames[f];
        const img = assigned[f] || lastImage[f];
        const src = img && mediaUrl(img);
        return (
          <motion.div
            key={f}
            className={`absolute overflow-hidden rounded-[8px] bg-[#d9d9d9] shadow-[0px_8px_40px_8px_rgba(0,0,0,0.16)] ${
              f === layout.order[0] ? "max-md:top-0! max-md:left-0! max-md:h-full! max-md:w-full! max-md:rounded-none max-md:shadow-none" : "max-md:hidden"
            }`}
            style={{ zIndex: s.z }}
            initial={false}
            animate={{
              left: pct(s.left, 612),
              top: pct(s.top, 408),
              width: pct(s.w, 612),
              height: pct(s.h, 408),
              opacity: assigned[f] ? 1 : 0,
            }}
            transition={TRANSITION}
            aria-hidden={!assigned[f] || undefined}
          >
            <AnimatePresence initial={false}>
              {src && (
                <motion.div key={src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={TRANSITION}>
                  <Image src={src} alt={assigned[f] ? img.alt || "" : ""} fill sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw" className="object-cover max-md:brightness-[0.32]" />
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
      // after another light section (industry challenges) the 144px gap is shared: 72 + 72
      // cs-sec: 64px top/bottom on mobile only
      className={`cs-sec pb-12 lg:pb-[72px] max-md:[--sec-pb:0px] ${data?._prev === "industry_challenges_section" ? "pt-12 lg:pt-[72px]" : "pt-18 lg:pt-36"}`}
      style={sectionBackground(data, { background: "var(--color-light-grey)" })}
    >
      <div className="cs-container flex flex-col items-center gap-8 max-md:gap-12 lg:gap-[41px]">
        {data.heading && (
          <h2
            className="cs-h2 cs-highlight cs-rich text-center text-(--color-heading) max-md:text-(--color-black)"
            dangerouslySetInnerHTML={{ __html: toHtml(data.heading) }}
          />
        )}

        {tabs.length > 0 && (
          <div className="flex w-full flex-col items-center gap-8 max-md:gap-10">
            {/* Pill tabs — scroll horizontally on small screens. Mobile: the wrapper is the fixed
                345×48 white pill (r56, shadow 0 2 9 10%) and the tabs scroll inside it; md:contents = no box at ≥ 768 */}
            <div className="md:contents max-md:w-full">
            <div className="max-w-full overflow-x-auto px-1 py-2 [scrollbar-width:none] max-md:overflow-visible max-md:p-0">
              <div role="tablist" className="flex w-max items-center gap-1 rounded-[56px] bg-white p-[5px] shadow-[0px_2px_4.5px_rgba(0,0,0,0.1)] max-md:grid max-md:w-full max-md:grid-cols-2 max-md:gap-x-2 max-md:gap-y-[7px] max-md:rounded-none max-md:bg-transparent max-md:p-0 max-md:shadow-none">
                {tabs.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    onClick={() => setActive(i)}
                    // mobile (Figma "Category tab", 2x2 grid): 48 tall pill, Medium 16, padding 12; active #3A3A37 / white,
                    // inactive white with a 1px #DADCDD stroke / #151411
                    className={`h-[39px] cursor-pointer whitespace-nowrap rounded-[50px] px-[14px] text-[16px] lg:text-[18px] leading-[22px] font-medium tracking-[-0.36px] transition-colors duration-300 max-md:h-12 max-md:border max-md:px-3 max-md:leading-5 max-md:tracking-normal ${
                      active === i
                        ? "bg-(--color-grey-dark) text-(--color-light-grey) max-md:border-[#3A3A37] max-md:bg-[#3A3A37] max-md:text-white"
                        : "bg-(--color-light-grey) text-(--color-grey-dark) hover:bg-(--color-grey-medium) max-md:border-[#DADCDD] max-md:bg-white max-md:text-[#151411] max-md:hover:bg-white"
                    }`}
                  >
                    {t.tab_label}
                  </button>
                ))}
              </div>
            </div>
            </div>

            <div role="tabpanel" className="relative flex w-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center xl:gap-[120px] max-md:-mx-6 max-md:w-[calc(100%+48px)] max-md:overflow-hidden max-md:bg-[#3A3A37] max-md:px-6 max-md:py-12">
              {/* stays mounted so its frames can animate from one tab's layout to the next */}
              {hasCollage && <Collage images={rows(tab.images)} />}

              {/* Old and new text share one grid cell, so the panel keeps its height while they
                  cross-fade (no empty frame / layout jump): old fades out fast, new fades in after it */}
              <div className="grid w-full max-w-[536px] lg:mt-[25px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: TEXT_IN }}
                  exit={{ opacity: 0, transition: TEXT_OUT }}
                  className="relative z-10 flex flex-col items-start gap-10 max-md:gap-6 xl:px-6 [grid-area:1/1]"
                >
                  <div className="flex flex-col gap-5 max-md:gap-4">
                    {tab.title && <h3 className="cs-h4 text-black max-md:text-(--color-light-grey)" dangerouslySetInnerHTML={{ __html: titleHtml(tab.title) }} />}
                    {tab.text && (
                      <div className="cs-p2 cs-rich text-(--color-grey-dark) max-md:text-(--color-light-grey)" dangerouslySetInnerHTML={{ __html: toHtml(tab.text) }} />
                    )}
                    {checklist.length > 0 && (
                      // mobile (Figma "Benefits"): 12px apart, X-Bold 18/22 -2%, check top-aligned on wrapped lines
                      <ul className="flex flex-col gap-2 max-md:gap-3">
                        {checklist.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 font-extrabold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-(--color-grey-dark) max-md:items-start max-md:leading-[22px] max-md:tracking-[-0.36px] max-md:text-(--color-light-grey)">
                            <Image src={CheckIcon} alt="" width={14} height={16} className="shrink-0 max-md:hidden" />
                            <Image src={CheckYellow} alt="" width={14} height={16} className="mt-[3px] shrink-0 md:hidden" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {ctaText && ctaUrl && (
                    <>
                      <CtaButton variant="dark" href={langHref(ctaUrl, lang)} wrap className="max-w-full max-md:hidden">
                        {ctaText}
                      </CtaButton>
                      {/* mobile: Figma "Button Mobile" outline (2px #FDFDFD) on the image panel, full width */}
                      <CtaButton variant="outline-light-yellow" href={langHref(ctaUrl, lang)} wrap className="w-full md:hidden">
                        {ctaText}
                      </CtaButton>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
