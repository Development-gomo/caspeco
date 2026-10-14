// src/components/sections/product/ProductSalesChannels.jsx
// ACF layout: sales_channels_section — "One backend, Multiple Sales Channels".
// Centred heading, pill tabs (POS / Mobile POS / Online Order / Kiosk …), and per
// tab an illustration left + title, text, checklist and CTA right. The dark pill
// slides between tabs and the panel swaps in from both sides (Figma Smart Animate).

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import CheckList from "./CheckList";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// panel halves: image enters from the left, copy from the right
const side = (dir, reduce) => ({
  out: { opacity: 0, x: reduce ? 0 : dir * 32, transition: { duration: 0.25, ease: "easeIn" } },
  in: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
});

export default function ProductSalesChannels({ data, lang = DEFAULT_LANG }) {
  const tabs = rows(data?.tabs).filter((t) => t.tab_label);
  const [active, setActive] = React.useState(0);
  const reduce = useReducedMotion();
  const pillId = React.useId();
  if (!data?.heading && tabs.length === 0) return null;

  const tab = tabs[active];
  // single image field; named "images" in the Page Builder Products group
  const imageField = tab ? tab.image || tab.images : null;
  const image = mediaUrl(imageField);

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col items-center gap-10 lg:gap-16">
        {data.heading && (
          <Reveal
            as="h2"
            className="cs-h3 cs-highlight cs-rich max-w-[905px] text-center font-extrabold text-black"
            dangerouslySetInnerHTML={{ __html: toHtml(data.heading) }}
          />
        )}

        {tabs.length > 0 && (
          <Reveal delay={0.15} className="flex w-full flex-col items-center gap-8">
            <div className="max-w-full overflow-x-auto px-1 py-2 [scrollbar-width:none]">
              <div role="tablist" className="flex w-max items-center gap-1 rounded-[56px] bg-white p-[5px] shadow-[0px_2px_4.5px_rgba(0,0,0,0.1)]">
                {tabs.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    onClick={() => setActive(i)}
                    className={`relative h-[39px] cursor-pointer whitespace-nowrap rounded-[50px] px-[14px] text-[16px] lg:text-[18px] leading-[22px] font-medium tracking-[-0.36px] transition-colors duration-300 ${
                      active === i ? "text-(--color-light-grey)" : "text-(--color-grey-dark) hover:bg-(--color-grey-medium)"
                    }`}
                  >
                    {active === i && (
                      <motion.span
                        layoutId={pillId}
                        aria-hidden
                        className="absolute inset-0 rounded-[50px] bg-(--color-grey-dark)"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{t.tab_label}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                role="tabpanel"
                initial="out"
                animate="in"
                exit="out"
                transition={{ staggerChildren: 0.08 }}
                className="flex w-full flex-col items-center gap-10 lg:flex-row lg:justify-between"
              >
                {image && (
                  <motion.div variants={side(-1, reduce)} className="relative aspect-[629/509] w-full max-w-[629px] shrink-0">
                    <Image src={image} alt={imageField?.alt || ""} fill sizes="(min-width: 1024px) 629px, 100vw" className="object-contain" />
                  </motion.div>
                )}

                <motion.div variants={side(1, reduce)} className="flex w-full max-w-[538px] flex-col items-start gap-10 lg:px-6">
                  <div className="flex flex-col gap-5">
                    {tab.title && <h3 className="cs-h4 text-black">{tab.title}</h3>}
                    {tab.text && <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(tab.text) }} />}
                    <CheckList items={tab.checklist} />
                  </div>
                  {tab.cta_text && tab.cta_url && (
                    <CtaButton href={langHref(tab.cta_url.trim(), lang)} wrap className="max-w-full">
                      {tab.cta_text}
                    </CtaButton>
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
