// src/components/ui/CaseCard.jsx
// Case study card from the "Case Study Listing" section: featured photo as background with a
// gradient, client logo top left, title (+ optional person/designation) at the bottom and a
// "Read full case" text link. Used by CaseStusyListing (grid) and HomeCaseStudies (slider).
// Needs the casestudies REST item with _embedded wp:featuredmedia; acf.logo is resolved to
// { url, alt } by PageBuilder, acf.client_logo is an ACF image array.
// reveal: fade-up on scroll (off inside the slider, where clipped slides would stay hidden).

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { DEFAULT_LANG, entryHref } from "@/config";
import ArrowLink from "@/components/ui/ArrowLink";

// Rendered title HTML → plain text for the logo alt fallback
const plain = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&#0?38;|&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&quot;|&#8220;|&#8221;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();

export default function CaseCard({ item, lang = DEFAULT_LANG, readMore, index = 0, reveal = true, className = "" }) {
  const acf = item?.acf || {};
  const media = item?._embedded?.["wp:featuredmedia"]?.[0];
  const img = media?.source_url || "";
  const logoField = [acf.logo, acf.client_logo].find((f) => f?.url);
  const title = item?.title?.rendered || "";
  const name = acf.person_name || "";
  const designation = acf.designation || "";

  const motionProps = reveal
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay: (index % 3) * 0.1 },
        viewport: { once: true },
      }
    : {};

  return (
    <motion.div
      className={`group relative isolate flex min-h-[460px] md:min-h-[530px] flex-col overflow-hidden rounded-lg bg-(--color-black) p-6 lg:p-8 text-white ${className}`}
      {...motionProps}
    >
      {/* BACKGROUND IMAGE + GRADIENT */}
      {img && (
        <Image
          src={img}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          alt={media?.alt_text || ""}
          className="-z-20 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/10 to-black/40"
        aria-hidden
      />

      {/* CLIENT LOGO */}
      {logoField ? (
        <Image
          src={logoField.url}
          alt={logoField.alt || plain(title)}
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
        {readMore}
      </ArrowLink>
    </motion.div>
  );
}
