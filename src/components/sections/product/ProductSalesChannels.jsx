// src/components/sections/product/ProductSalesChannels.jsx
// ACF layout: sales_channels_section — "One backend, Multiple Sales Channels".
// Centred heading, pill tabs (POS / Mobile POS / Online Order / Kiosk …), and per
// tab an illustration left + title, text, checklist and CTA right. The dark pill
// slides between tabs and the panel swaps in from both sides (Figma Smart Animate).
// Also used on the ICP pages ("Time to build your perfect set up"): optional sub_heading under
// the heading, cta_variant "outline" for the outlined tab button (Figma "See POS").

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import CheckList from "./CheckList";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";
import { MobileTabFade, revealTab, titleHtml } from "../home/HomeHelpTabs";

// panel halves: image enters from the left, copy from the right
const side = (dir, reduce) => ({
  out: { opacity: 0, x: reduce ? 0 : dir * 32, transition: { duration: 0.25, ease: "easeIn" } },
  in: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
});

// defaultCtaVariant: used when the layout has no cta_variant field (ICP pages → "outline")
// variant "icp" — Figma "ICP_1_Time to build" (1272×590): image 500×363 (radius 8) 64px in from
// the left and 105px below the tab bar, text column 488 wide ending 26px from the right,
// 73px below the panel; heading + sub-heading #151411.
// Figma section-gap rule (consecutive light sections share one 144 gap):
//  - after the ICP intro: 72 + 72
//  - after the USP accordion ("Run many restaurants like one business", Adding locations): 144 + 0
//  - before another tab section: 0 + 144
// Mobile (cs-sec): 64 top/bottom (Figma "Company size mobile" padding 64), keeping the same
// 0-padding joins as desktop (after the USP accordion / before another tab section).
function sectionPadding(data) {
  const top = data?._prev === "icp_intro_section" || data?._prev === "industry_challenges_section" ? "pt-12 lg:pt-[72px]" : data?._prev === "usp_accordion" ? "pt-0 max-md:[--sec-pt:0px]" : "pt-18 lg:pt-36";
  const bottom = data?._next === "tab_section" ? "pb-0 max-md:[--sec-pb:0px]" : "pb-18 lg:pb-36";
  return `${top} ${bottom}`;
}

// mobilePanel (Home Tab Section with "ICP Tab styling" enabled): below 768px the Figma Home "Company size mobile" design —
// all tabs as a 2×2 grid of buttons (no scrolling) and the tab image as the background of the content (white text)
export default function ProductSalesChannels({ data, lang = DEFAULT_LANG, defaultCtaVariant = "yellow", variant, mobilePanel = false }) {
  const icp = variant === "icp";
  const panel = mobilePanel;
  const tabs = rows(data?.tabs).filter((t) => t.tab_label);
  const [active, setActive] = React.useState(0);
  const reduce = useReducedMotion();
  const pillId = React.useId();
  const tabScroller = React.useRef(null);
  if (!data?.heading && tabs.length === 0) return null;

  const tab = tabs[active];
  // single image field; named "images" in the Page Builder Products group
  const imageField = tab ? tab.image || tab.images : null;
  const image = mediaUrl(imageField);

  return (
    <section className={`cs-sec ${icp ? sectionPadding(data) : "py-18 lg:py-36"} ${panel ? "max-md:[--sec-pb:0px]" : ""}`} style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      {/* mobile: Product 48 between headline / tabs+image / text, ICP 40 (Figma auto-layout gaps) */}
      <div className={`cs-container flex flex-col items-center gap-10 lg:gap-14 ${icp && !panel ? "" : "max-md:gap-12"}`}>
        {(data.heading || data.sub_heading) && (
          <Reveal className="flex max-w-[905px] flex-col items-center gap-5 text-center max-md:gap-4">
            {data.heading && <h2 className={`cs-h3 cs-title cs-highlight cs-rich ${icp ? "font-extrabold! text-(--color-black)" : "font-extrabold text-black max-md:text-(--color-black)"}`} dangerouslySetInnerHTML={{ __html: toHtml(data.heading) }} />}
            {data.sub_heading && <p className={`cs-card-title font-bold text-[22px] lg:text-[32px] leading-8 tracking-[-0.64px] ${icp ? "text-(--color-black)" : "text-black"}`}>{data.sub_heading}</p>}
          </Reveal>
        )}

        {tabs.length > 0 && (
          <Reveal delay={0.15} className={`flex w-full flex-col items-center ${icp ? "gap-10 lg:gap-[97px]" : "gap-6"}`}>
            {/* Mobile: the wrapper is the fixed-width pill (ICP 48 tall white r56 / Product 49 tall #FDFDFD r50,
                shadow 0 2 9 10%) and the tabs scroll inside it; md:contents = no box at ≥ 768 */}
            <div
              className={`md:contents max-md:relative max-md:w-full ${
                panel ? "" : `max-md:overflow-hidden max-md:shadow-[0px_2px_9px_rgba(0,0,0,0.1)] ${icp ? "max-md:h-12 max-md:rounded-[56px] max-md:bg-white" : "max-md:h-[49px] max-md:rounded-[50px] max-md:bg-(--color-light-grey)"}`
              }`}
            >
            <div ref={tabScroller} data-tab-scroller className={`max-w-full overflow-x-auto px-1 py-2 [scrollbar-width:none] max-md:p-0 ${panel ? "max-md:overflow-visible" : "max-md:h-full max-md:overscroll-x-contain max-md:[&::-webkit-scrollbar]:hidden"}`}>
              <div
                role="tablist"
                className={`flex w-max items-center gap-1 rounded-[56px] bg-white p-[5px] shadow-[0px_2px_4.5px_rgba(0,0,0,0.1)] max-md:rounded-none max-md:bg-transparent max-md:py-0 max-md:shadow-none ${panel ? "max-md:grid max-md:w-full max-md:grid-cols-2 max-md:gap-x-2 max-md:gap-y-[7px] max-md:p-0" : `max-md:h-full ${icp ? "" : "max-md:pl-1.5"}`}`}
              >
                {tabs.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    onClick={(e) => {
                      setActive(i);
                      revealTab(e.currentTarget);
                    }}
                    // mobile — ICP (Figma "Category tab"): Medium 14, padding 12, active 39 tall #3A3A37 / white,
                    // inactive 31 tall #121212; Product ("Menu bar item"): Light 16/20 -2%, all 39 tall
                    className={`relative h-[39px] cursor-pointer whitespace-nowrap rounded-[50px] px-[14px] text-[16px] lg:text-[18px] leading-[22px] font-medium tracking-[-0.36px] transition-colors duration-300 ${
                      panel
                        ? "max-md:h-12 max-md:border max-md:px-3 max-md:text-[16px] max-md:leading-5 max-md:tracking-normal max-md:whitespace-normal"
                        : icp ? "max-md:px-3 max-md:text-[14px] max-md:leading-[17px] max-md:tracking-normal" : "max-md:font-light max-md:leading-5 max-md:tracking-[-0.32px]"
                    } ${
                      active === i
                        ? `text-(--color-light-grey) ${panel ? "max-md:border-[#3A3A37] max-md:text-white" : icp ? "max-md:text-white" : ""}`
                        : `text-(--color-grey-dark) hover:bg-(--color-grey-medium) ${panel ? "max-md:border-[#DADCDD] max-md:bg-white max-md:text-[#151411] max-md:hover:bg-white" : icp ? "max-md:h-[31px] max-md:text-[#121212]" : ""}`
                    }`}
                  >
                    {active === i && (
                      <motion.span
                        layoutId={pillId}
                        aria-hidden
                        className={`absolute inset-0 rounded-[50px] bg-(--color-grey-dark) ${icp ? "max-md:bg-[#3A3A37]" : ""}`}
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{t.tab_label}</span>
                  </button>
                ))}
              </div>
            </div>
            {!panel && <MobileTabFade scrollerRef={tabScroller} />}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                role="tabpanel"
                initial="out"
                animate="in"
                exit="out"
                transition={{ staggerChildren: 0.08 }}
                className={`flex w-full flex-col items-center gap-10 lg:flex-row lg:justify-between ${icp ? "lg:pb-[73px]" : "max-md:gap-12"} ${panel ? "relative max-md:-mx-6 max-md:w-[calc(100%+48px)] max-md:overflow-hidden max-md:bg-[#3A3A37] max-md:px-6 max-md:py-12" : ""}`}
              >
                {image && icp ? (
                  // ICP: 500×363 box (radius 8); image_size "small" = Figma "ICP_3_Run many restaurants",
                  // a 413×300 image (radius 6.6) centred in the same box, so the panel height is unchanged
                  // mobile: full-bleed 393×285, no radius (Figma "New image"), also for image_size "small"
                  <motion.div variants={side(-1, reduce)} className={`relative aspect-[500/363] w-full max-w-[500px] shrink-0 lg:ml-16 ${panel ? "max-md:absolute max-md:inset-0 max-md:z-0 max-md:ml-0 max-md:h-full max-md:w-full max-md:max-w-none max-md:aspect-auto" : "max-md:-mx-6 max-md:w-[calc(100%+48px)] max-md:max-w-none max-md:aspect-[393/285]"}`}>
                    <div className={`absolute overflow-hidden max-md:inset-0 max-md:rounded-none ${data.image_size === "small" ? "inset-[8.7%] rounded-[6.6px]" : "inset-0 rounded-[8px]"}`}>
                      <Image src={image} alt={imageField?.alt || ""} fill sizes="(min-width: 1024px) 500px, 100vw" className={`object-cover ${panel ? "max-md:brightness-[0.32]" : ""}`} />
                    </div>
                  </motion.div>
                ) : image && (
                  <motion.div variants={side(-1, reduce)} className="relative aspect-[629/509] w-full max-w-[629px] shrink-0 max-md:aspect-[345/251]">
                    <Image src={image} alt={imageField?.alt || ""} fill sizes="(min-width: 1024px) 629px, 100vw" className="object-contain" />
                  </motion.div>
                )}

                <motion.div variants={side(1, reduce)} className={`flex w-full flex-col items-start gap-10 max-md:gap-6 ${panel ? "relative z-10" : ""} ${icp ? "max-w-[488px] lg:mr-[26px]" : "max-w-[538px] lg:px-6"}`}>
                  {/* mobile: title ICP Bold 26/28 (cs-h4) / Product X-Bold 36 (cs-title); body ICP Regular / Product Light 18/22;
                      benefits 12 apart, X-Bold 18/22 (ICP -2% #3F3E3C, Product 0 #171717) */}
                  <div className="flex flex-col gap-5 max-md:gap-4">
                    {tab.title && <h3 className={`cs-h4 ${icp ? "text-(--color-black)" : "cs-title text-black max-md:text-(--color-black)"} ${panel ? "max-md:text-(--color-light-grey)" : ""}`} dangerouslySetInnerHTML={{ __html: panel ? titleHtml(tab.title) : toHtml(tab.title) }} />}
                    {tab.text && <div className={`cs-p2 cs-rich text-(--color-grey-dark) ${icp ? "" : "max-md:font-light"} ${panel ? "max-md:text-(--color-light-grey)" : ""}`} dangerouslySetInnerHTML={{ __html: toHtml(tab.text) }} />}
                    <CheckList
                      items={tab.checklist}
                      onDark={panel}
                      className={`max-md:gap-3 max-md:[&>li]:leading-[22px] ${
                        icp
                          ? "max-md:[&>li]:items-start max-md:[&>li]:tracking-[-0.36px] max-md:[&_img]:mt-[3px]"
                          : "max-md:[&>li]:tracking-normal max-md:[&>li]:text-[#171717]"
                      }`}
                    />
                  </div>
                  {tab.cta_text && tab.cta_url && (
                    // ICP tabs: the outline button fills dark grey on hover (client request)
                    <>
                      <CtaButton
                        variant={(data.cta_variant || defaultCtaVariant) === "outline" ? (icp ? "outline-dark-grey" : "outline-dark") : "yellow"}
                        href={langHref(tab.cta_url.trim(), lang)}
                        wrap
                        className={`max-w-full ${icp ? "max-md:w-full" : ""} ${panel ? "max-md:hidden" : ""}`}
                      >
                        {tab.cta_text}
                      </CtaButton>
                      {/* mobile panel: Figma "Button Mobile" outline, 2px #FDFDFD, on the image */}
                      {panel && (
                        <CtaButton variant="outline-light-yellow" href={langHref(tab.cta_url.trim(), lang)} wrap className="w-full md:hidden">
                          {tab.cta_text}
                        </CtaButton>
                      )}
                    </>
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </Reveal>
        )}
      </div>
    </section>
  );
}
