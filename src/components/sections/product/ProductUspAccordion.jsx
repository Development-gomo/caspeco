// src/components/sections/product/ProductUspAccordion.jsx
// ACF layout: usp_accordion_section — "Turn saved time into better business".
// Heading + text + CTA left, USP accordion right. The open item turns dark petrol
// and shows its text and link; only one item is open at a time.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import Chevron from "../../../../public/icons/product/chevron.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

function AccordionItem({ item, isOpen, onToggle, lang }) {
  const icon = mediaUrl(item.icon);
  return (
    <div
      className={`rounded-[8px] pl-5 pr-6 lg:pr-8 transition-colors duration-300 ${
        isOpen ? "bg-(--color-dark-petrol)" : "bg-white shadow-[-1px_0px_4px_rgba(0,0,0,0.1),0px_3px_4px_rgba(0,0,0,0.1)]"
      }`}
    >
      <h3 className="normal-case">
        <button type="button" onClick={onToggle} aria-expanded={isOpen} className="flex w-full cursor-pointer items-center gap-4 py-[21px] text-left">
          <span className="relative flex size-7 shrink-0 items-center justify-center">
            {icon && (
              <Image src={icon} alt="" width={28} height={28} className={`max-h-7 w-auto object-contain transition ${isOpen ? "brightness-0 invert" : ""}`} />
            )}
          </span>
          <span className={`flex-1 font-medium text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] ${isOpen ? "text-(--color-light-grey)" : "text-(--color-grey-dark)"}`}>
            {item.title}
          </span>
          <Image
            src={Chevron}
            alt=""
            width={14}
            height={8}
            className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 brightness-0 invert" : ""}`}
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
            <div className="flex flex-col items-start gap-[15px] pb-[21px] pl-11 -mt-1.5">
              {item.text && (
                <div
                  className="cs-rich font-light text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px] text-(--color-light-grey)"
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

export default function ProductUspAccordion({ data, lang = DEFAULT_LANG }) {
  const items = rows(data?.items).filter((i) => i.title);
  const [open, setOpen] = React.useState(0);
  const { heading, short_text, cta_text, cta_url } = data || {};
  if (!heading && items.length === 0) return null;

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex flex-col items-start gap-10 lg:max-w-[507px]">
          <div className="flex flex-col gap-4">
            {heading && <h2 className="cs-h3 cs-highlight font-extrabold text-(--color-black)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>
          {cta_text && cta_url && <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>}
        </div>

        {items.length > 0 && (
          <div className="flex w-full flex-col gap-2 lg:max-w-[671px]">
            {items.map((item, i) => (
              <AccordionItem key={i} item={item} lang={lang} isOpen={open === i} onToggle={() => setOpen(open === i ? null : i)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
