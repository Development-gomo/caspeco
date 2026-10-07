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

export default function HomeFaq({ data, lang = DEFAULT_LANG }) {
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
    <section className="pb-18 lg:pb-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container grid grid-cols-1 gap-10 lg:grid-cols-[549px_minmax(0,1fr)] lg:gap-[50px]">
        <div className="flex flex-col items-start gap-5">
          {heading && <h2 className="cs-h2 cs-highlight text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <p className="cs-p1 max-w-[493px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {cta_text && cta_url && <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>}
        </div>

        {faqs.length > 0 && (
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className={`rounded-[8px] transition-colors duration-300 ${
                    isOpen ? "bg-[#f1f1f1]" : "bg-white shadow-[-1px_0px_5px_2px_rgba(0,0,0,0.1)]"
                  }`}
                >
                  <h3 className="normal-case">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 px-6 py-4 text-left"
                    >
                      <span className="font-medium text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-black">{faq.question}</span>
                      <Image
                        src={ToggleIcon}
                        alt=""
                        width={38}
                        height={38}
                        className={`shrink-0 transition-transform duration-300 ${isOpen ? "-rotate-90" : "rotate-90"}`}
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
                        <div
                          className="cs-rich px-6 pb-6 -mt-1 max-w-[596px] font-light text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px] text-black"
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
      </div>

      {schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
    </section>
  );
}
