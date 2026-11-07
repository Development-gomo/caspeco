// src/components/sections/inner-pages/CaseStusyListing.jsx
// ACF layout: case_study_listing. Optional fields:
//   bg_image (decorative image layer), bg_color (section background colour via sectionBackground()).
//   short_text (textarea) -> intro paragraph under the heading, only when non-empty.
//   heading (textarea) -> rendered through toHtml() so line breaks survive.
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { DEFAULT_LANG } from "@/config";
import CtaButton from "@/components/ui/CtaButton";
import CaseCard from "@/components/ui/CaseCard";
import { sectionBackground, toHtml } from "@/lib/content";

const INITIAL_COUNT = 9;
const LOAD_MORE_STEP = 9;

export default function CaseStudyListing({
  data,
  lang = DEFAULT_LANG,
  prefetchedCases,
}) {
  const cases = prefetchedCases || [];
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visibleCases = cases.slice(0, visibleCount);
  const hasMore = visibleCount < cases.length;
  const bgImage = data?.bg_image?.url || "";
  const {
    sub_heading,
    heading,
    short_text,
    cta_text,
    cta_url,
    read_more_text,
    load_more_text,
  } = data || {};

  return (
    <>
      <div id="next"></div>
      <section id="case-section" className="py-15 md:py-30 relative overflow-hidden" style={sectionBackground({ bg_color: data?.bg_color })}>
        {bgImage ? (
          <div
            className="absolute inset-0 -z-2"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundPosition:"0% 40%",
              backgroundRepeat: "no-repeat",
              backgroundSize: "auto",
            }}
            suppressHydrationWarning
          />
        ) : null}

        <div className="w-full px-6 web-width">
          {/* SUB HEADING */}
          {sub_heading && (
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="h-2 w-2 rounded-full bg-(--color-yellow)"></span>
              <span className="subheading-label">{sub_heading}</span>
            </motion.div>
          )}

          {/* TOP HEADING + CTA */}
          <div className="md:flex md:justify-between items-end mb-10 lg:mb-14">
            {short_text ? (
              <motion.div
                className="mb-4 md:mb-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                viewport={{ once: true }}
              >
                <div className="section-heading" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
                <div
                  className="cs-p2 cs-rich max-w-[680px] mt-4 text-(--color-grey-dark)"
                  dangerouslySetInnerHTML={{ __html: toHtml(short_text) }}
                />
              </motion.div>
            ) : (
              <motion.div
                className="section-heading mb-4 md:mb-0"
                dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                viewport={{ once: true }}
              />
            )}

            {cta_text && cta_url && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCases.map((item, idx) => (
              <CaseCard
                key={item.id}
                item={item}
                lang={lang}
                readMore={read_more_text}
                index={idx}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <CtaButton onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}>
                {load_more_text || "Load More"}
              </CtaButton>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
