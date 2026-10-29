// src/components/sections/product/ProductUspAccordion.jsx
// ACF layout: usp_accordion_section — "Turn saved time into better business".
// Heading + text + CTA left, USP accordion right. The open item turns dark petrol
// and shows its text and link; only one item is open at a time.
// Mobile (< 768, Figma Product "USP's — Mobile" / ICP "USP's — Mobile"): padding 64, intro gap
// 24, items padding 20 (title Medium 20/24, icon → title 12, body indent 40, Light 16/20 —
// Regular on the ICP pages), closed items shadow -1 0 5 @10% (on the item and its frame).
// overflow-x-clip: the items slide in from 32px right, which would widen the page before they reveal.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import Chevron from "../../../../public/icons/product/chevron.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// enable_gradient (ICP "USP Accordion"): Figma "USP's" fill — #DADCDD 80% → #FFFFFF 50%, top to
// bottom, over #FDFDFD
const GRADIENT = "linear-gradient(180deg, rgba(218, 220, 221, 0.80) -0.94%, rgba(255, 255, 255, 0.50) 100.94%), #FDFDFD";

function AccordionItem({ item, isOpen, onToggle, lang, variant }) {
  const icon = mediaUrl(item.icon);
  return (
    <div
      className={`rounded-[8px] pl-5 pr-6 lg:pr-8 max-md:pr-5 transition-colors duration-300 ${
        isOpen
          ? "bg-(--color-dark-petrol) max-md:shadow-[-1px_0px_5px_rgba(0,0,0,0.1)]"
          : "bg-white shadow-[-1px_0px_4px_rgba(0,0,0,0.1),0px_3px_4px_rgba(0,0,0,0.1)] max-md:shadow-[-1px_0px_5px_rgba(0,0,0,0.1),-1px_0px_5px_rgba(0,0,0,0.1)]"
      }`}
    >
      <h3 className="normal-case">
        {/* Figma: icon box 28, title line 24 at the top of the row, chevron centred on the title;
            open item 21 + 24 + 15 + text + 15 + link + 21 (the icon column doesn't add height) */}
        <button type="button" onClick={onToggle} aria-expanded={isOpen} className={`flex w-full cursor-pointer items-start gap-4 pt-[21px] text-left max-md:gap-3 max-md:pt-5 ${isOpen ? "pb-[11px] max-md:pb-[15px]" : "pb-[21px] max-md:pb-5"}`}>
          <span className="relative flex size-7 shrink-0 items-center justify-center">
            {icon && (
              <Image src={icon} alt="" width={28} height={28} className={`max-h-7 w-auto object-contain transition ${isOpen ? "brightness-0 invert" : ""}`} />
            )}
          </span>
          <span className={`flex-1 font-medium text-[18px] max-md:text-[20px] lg:text-[20px] leading-6 tracking-[-0.4px] ${isOpen ? "text-(--color-light-grey)" : "text-(--color-grey-dark)"}`}>
            {item.title}
          </span>
          <Image
            src={Chevron}
            alt=""
            width={14}
            height={8}
            className={`mt-2 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 brightness-0 invert max-md:mt-0" : "max-md:mt-2.5"}`}
          />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (item.text || item.link_text) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* No negative margin here: the overflow-hidden wrapper would clip the first line */}
            <div className="flex flex-col items-start gap-[15px] pb-[21px] pl-11 max-md:pb-5 max-md:pl-10">
              {item.text && (
                <div
                  className={`cs-rich font-light text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px] text-(--color-light-grey) max-md:leading-5 max-md:tracking-[-0.32px] ${variant === "icp" ? "max-md:font-normal" : ""}`}
                  dangerouslySetInnerHTML={{ __html: toHtml(item.text) }}
                />
              )}
              {item.link_text && item.link_url && (
                <ArrowLink tone="light" href={langHref(item.link_url.trim(), lang)}>
                  {item.link_text}
                </ArrowLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// variant "icp": heading X-Bold (Figma ICP "USP's"); the global .cs-h3 weight would win otherwise
export default function ProductUspAccordion({ data, lang = DEFAULT_LANG, variant }) {
  const items = rows(data?.items).filter((i) => i.title);
  const [open, setOpen] = React.useState(0);
  const { heading, short_text, sub_text, cta_text, cta_url } = data || {};
  if (!heading && items.length === 0) return null;

  return (
    <section className="py-18 lg:py-36 max-md:py-16 max-md:overflow-x-clip" style={sectionBackground(data, { background: data?.enable_gradient ? GRADIENT : "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <Reveal className="flex flex-col items-start gap-10 max-md:gap-6 lg:max-w-[507px]">
          <div className="flex flex-col gap-4">
            {heading && <h2 className={`cs-h3 cs-title cs-highlight text-black ${variant === "icp" ? "font-extrabold!" : "font-extrabold"}`} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className={`cs-p2 cs-rich text-(--color-grey-dark) ${variant === "icp" ? "" : "max-md:font-light"}`} dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
            {/* optional second paragraph — Figma ICP "USP's": Bold 20/24, 24 below the text */}
            {sub_text && <div className="cs-p2 cs-rich mt-2 max-md:mt-0 font-bold text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(sub_text) }} />}
          </div>
          {cta_text && cta_url && (
            <div className="max-md:hidden">
              <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>
            </div>
          )}
        </Reveal>

        {items.length > 0 && (
          <div className="flex w-full flex-col gap-2 lg:max-w-[671px]">
            {items.map((item, i) => (
              <Reveal key={i} x={32} y={0} delay={0.15 + i * 0.1}>
                <AccordionItem item={item} lang={lang} variant={variant} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)} />
              </Reveal>
            ))}
          </div>
        )}

        {/* mobile: button below the list, 48 under it (Figma Product 601:9591 / ICP 601:14114) */}
        {cta_text && cta_url && (
          <div className="md:hidden">
            <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>
          </div>
        )}
      </div>
    </section>
  );
}
