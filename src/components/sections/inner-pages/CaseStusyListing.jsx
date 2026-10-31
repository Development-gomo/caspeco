// src/components/sections/HomeCaseStudies.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";


import { DEFAULT_LANG, entryHref } from "@/config";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";

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
    cta_text,
    cta_url,
    read_more_text,
    load_more_text,
  } = data || {};

  return (
    <>
      <div id="next"></div>
      <section id="case-section" className="py-15 md:py-30 relative overflow-hidden">
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
            <motion.div
              className="section-heading mb-4 md:mb-0"
              dangerouslySetInnerHTML={{ __html: heading }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
            />

            {cta_text && cta_url && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCases.map((item, idx) => {
              const acf = item?.acf || {};
              const img =
                item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
              const logo = [acf.logo, acf.client_logo].find((f) => f?.url)?.url || "";
              const title = item?.title?.rendered || "";
              const name = acf.person_name || "";
              const designation = acf.designation || "";

              return (
                <motion.div
                  key={item.id}
                  className="group relative isolate flex min-h-[460px] md:min-h-[530px] flex-col overflow-hidden rounded-lg bg-(--color-black) p-6 lg:p-8 text-white"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* BACKGROUND IMAGE + GRADIENT */}
                  {img && (
                    <Image
                      src={img}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      alt={title}
                      className="-z-20 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  )}
                  <div
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-black/40"
                    aria-hidden
                  />

                  {/* CLIENT LOGO */}
                  {logo ? (
                    <Image
                      src={logo}
                      alt={title}
                      width={134}
                      height={48}
                      className="h-10 lg:h-12 w-auto max-w-[134px] object-contain object-left"
                    />
                  ) : (
                    <span className="h-10 lg:h-12" aria-hidden />
                  )}

                  {/* TITLE + PERSON */}
                  <div className="mt-auto">
                    {title && (
                      <h3
                        className="mb-8 text-[24px] lg:text-[26px] leading-8 font-bold tracking-[-0.5px]"
                        dangerouslySetInnerHTML={{ __html: title }}
                      />
                    )}
                    {(name || designation) && (
                      <div className="flex items-center gap-3">
                        <span className="h-12 w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow)" aria-hidden />
                        <span className="flex flex-col gap-1">
                          {name && <span className="font-bold text-[20px] leading-6 tracking-[-0.4px]">{name}</span>}
                          {designation && <span className="font-medium text-[16px] leading-5 text-(--color-light-grey)">{designation}</span>}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* TEXT LINK */}
                  <ArrowLink
                    tone="light"
                    href={entryHref("casestudy", item.slug, lang)}
                    className="mt-4 self-end"
                  >
                    {read_more_text}
                  </ArrowLink>
                </motion.div>
              );
            })}
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
