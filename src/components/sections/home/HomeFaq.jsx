// src/components/sections/home/HomeFaq.jsx
// ACF layout: faq_section — "Frequently asked questions", two columns
// (heading + CTA left, accordion right). Also outputs FAQPage JSON-LD.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import ToggleIcon from "../../../../public/icons/home/faq-closed.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { rows, sectionBackground, toHtml } from "@/lib/content";

// Sections whose bottom padding already gives the FAQ its top spacing (same light
// background, as on the homepage); after anything else the FAQ adds its own.
const FLUSH_AFTER = new Set(["insights_section"]);
// Light sections that start with 72px of their own: the FAQ keeps 72 below (Figma 72 + 72 = 144)
const HALF_BEFORE = new Set(["related_icp"]);

export default function HomeFaq({ data, lang = DEFAULT_LANG, prevLayout }) {
  const faqs = rows(data?.faqs)
    .map((f) => ({ question: f.question, answer: f.answer || f.answers }))
    .filter((f) => f.question);
  const [open, setOpen] = React.useState(0); // first item open, as in Figma
  const { heading, short_text, cta_text, cta_url } = data || {};
  if (!heading && faqs.length === 0) return null;

  const schema = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: (f.answer || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
        })),
      }
    : null;

  return (
    // Mobile (Figma Home "iPhone 16 - 5" 601:9439): 64 top and bottom; 0 below when the next section brings its own 64.
    // Title → 16 → intro (Regular 18/22) → 40 → list → 24 → button (the button moves below the list on mobile)
    <section className={`${HALF_BEFORE.has(data?._next) ? "pb-12 max-md:pb-0 lg:pb-[72px]" : "pb-18 max-md:pb-16 lg:pb-36"} ${FLUSH_AFTER.has(prevLayout ?? data?._prev) ? "" : "pt-18 max-md:pt-16 lg:pt-36"}`} style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container grid grid-cols-1 gap-10 lg:grid-cols-[549px_minmax(0,1fr)] lg:gap-[50px]">
        <div className="flex flex-col items-start gap-5 max-md:gap-4">
          {heading && <h2 className="cs-h2 cs-highlight text-(--color-heading) max-md:text-(--color-black)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <div className="cs-p1 cs-rich max-w-[493px] text-(--color-grey-dark) max-md:font-normal!" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {cta_text && cta_url && (
            <div className="max-md:hidden">
              <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>
            </div>
          )}
        </div>

        {faqs.length > 0 && (
          <div className="flex flex-col gap-4 max-md:gap-2">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  // Figma mobile: closed = white with a 1px #DFDFDC inside stroke and no shadow; open = #F1F1F1
                  className={`rounded-[8px] transition-colors duration-300 ${
                    isOpen ? "bg-[#f1f1f1]" : "bg-white shadow-[-1px_0px_5px_2px_rgba(0,0,0,0.1)] max-md:bg-[#fff] max-md:shadow-[inset_0_0_0_1px_#DFDFDC]"
                  }`}
                >
                  <h3 className="normal-case">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className={`flex w-full cursor-pointer items-center justify-between gap-6 px-6 max-md:px-4 text-left transition-[padding] duration-300 ${isOpen ? "pt-6 pb-2 max-md:pt-4 max-md:pb-3" : "py-4 max-md:gap-3"}`}
                    >
                      <span className="font-medium text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-(--color-heading) max-md:text-[16px] max-md:leading-[22px] max-md:tracking-[-0.32px]">{faq.question}</span>
                      <Image
                        src={ToggleIcon}
                        alt=""
                        width={38}
                        height={38}
                        className={`shrink-0 transition-transform duration-300 max-md:size-9 ${isOpen ? "-rotate-90" : "rotate-90"}`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && faq.answer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {/* No negative margin here: the overflow-hidden wrapper would clip the first line */}
                        <div
                          className="cs-rich px-6 pb-[25px] max-w-[596px] font-light text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px] text-(--color-heading) max-md:max-w-[307px] max-md:px-4 max-md:pb-4 max-md:font-normal max-md:text-[14px] max-md:leading-[18px] max-md:tracking-[-0.28px]"
                          dangerouslySetInnerHTML={{ __html: toHtml(faq.answer) }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {cta_text && cta_url && (
          <div className="md:hidden max-md:-mt-4">
            <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>
          </div>
        )}
      </div>

      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
    </section>
  );
}
