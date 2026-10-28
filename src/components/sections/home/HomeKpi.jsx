// src/components/sections/home/HomeKpi.jsx
// ACF layout: home_kpi_section — "Best-performing customers last month" flip cards.
// Front: label + stat + optional note (cards → note, small footnote). Back: checklist (back_items). Clicking the card slides it left to the back.
// Optional (ICP pages): short_text under the heading; bottom_text + cta_text / cta_url under the cards.

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import KpiArrow from "../../../../public/icons/home/kpi-arrow.svg";
import CircleInfo from "../../../../public/icons/home/circle-info.svg";
import CheckYellow from "../../../../public/icons/home/check-yellow.svg";
import { highlightHtml, rows, sectionBackground, toHtml } from "@/lib/content";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, langHref } from "@/config";
import CountUp from "@/components/ui/CountUp";

function Dashes({ flipped }) {
  return (
    <span className="absolute right-4 bottom-[12px] max-md:bottom-4 flex gap-[5.5px]" aria-hidden>
      <span className={`h-[2px] w-[24.75px] rounded-[1.4px] ${flipped ? "bg-(--color-light-grey)" : "bg-(--color-yellow)"}`} />
      <span className={`h-[2px] w-[24.75px] rounded-[1.4px] ${flipped ? "bg-(--color-yellow)" : "bg-(--color-light-grey)"}`} />
    </span>
  );
}

// Figma: Tenon Light Italic 12/20, 0.1px, rgba(251,250,249,0.8); 16px icon 3px below the text top, text 4px after it
// (mobile Figma "Information": icon at x24, 2px below the text top; text at x46)
function InfoLine({ children, className = "" }) {
  return (
    <span className="flex items-start gap-1 max-md:gap-1.5 text-[12px] leading-5 tracking-[0.1px] italic font-light text-[rgba(251,250,249,0.8)]">
      <Image src={CircleInfo} alt="" width={16} height={16} className="mt-[3px] shrink-0 max-md:mt-0.5 max-md:ml-0.5" />
      <span className={className}>{children}</span>
    </span>
  );
}

function KpiCard({ card, hint }) {
  const [flipped, setFlipped] = React.useState(false);
  const backItems = rows(card.back_items).map((r) => r.text).filter(Boolean);
  const canFlip = backItems.length > 0;

  // Front and back sit side by side in a strip; "flipping" slides the strip left
  const face = "relative block h-full w-1/2 shrink-0";

  return (
    <button
      type="button"
      onClick={() => canFlip && setFlipped((f) => !f)}
      aria-pressed={canFlip ? flipped : undefined}
      className={`relative h-[228px] max-md:h-[124px] w-full overflow-hidden rounded-[8px] bg-(--color-dark-petrol) text-left text-(--color-light-grey) shadow-[0px_4px_6px_0px_rgba(0,0,0,0.16)] max-md:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)] ${canFlip ? "cursor-pointer" : "cursor-default"}`}
    >
      <motion.span
        className="absolute inset-y-0 left-0 flex w-[200%]"
        animate={{ x: flipped ? "-50%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* FRONT */}
        <span className={face} aria-hidden={flipped || undefined}>
          <span className="absolute left-6 top-6 max-w-[150px] max-md:top-[88px] max-md:max-w-[200px] text-[20px] leading-6 tracking-[-0.4px] max-md:text-[16px] max-md:leading-5 max-md:tracking-[-0.32px]">{card.label}</span>
          <span className="absolute left-6 top-[84px] max-md:top-4 font-bold text-[64px] leading-16 tracking-[-1.28px] md:text-[80px] md:tracking-[-1.6px] max-md:font-extrabold">
            {/* Figma: digits Tenon Bold, a trailing "%" Tenon Regular */}
            {String(card.value ?? "").trim().endsWith("%") ? (
              <>
                <CountUp value={String(card.value).trim().slice(0, -1)} />
                <span className="font-normal">%</span>
              </>
            ) : (
              <CountUp value={card.value} />
            )}
          </span>
          {canFlip && <Image src={KpiArrow} alt="" width={36} height={36} className="absolute right-4 top-24 max-md:top-4" />}
          {/* Bottom-left info block (Figma "Circle-Info" + label: icon x22, text x42, last line ends
              5px above the card edge). Optional note (e.g. "*per month per venue") stacks above the hint;
              right edge stops before the slide dashes. */}
          {(card.note || hint) && (
            <span className="absolute left-[22px] right-[72px] bottom-[5px] flex flex-col max-md:hidden">
              {card.note && <InfoLine className="line-clamp-2">{card.note}</InfoLine>}
              {hint && <InfoLine>{hint}</InfoLine>}
            </span>
          )}
        </span>

        {/* BACK */}
        {canFlip && (
          <span className={face} aria-hidden={!flipped || undefined}>
            <span className="absolute left-[22px] right-[64px] top-[46px] flex flex-col gap-[10px] max-md:left-6 max-md:top-3 max-md:gap-1.5">
              {backItems.map((text, i) => (
                <span key={i} className="flex items-start gap-2 text-[16px] max-md:text-[14px] leading-5 max-md:leading-4 tracking-[0.1px] text-white">
                  <Image src={CheckYellow} alt="" width={14} height={16} className="mt-0.5 shrink-0" />
                  {text}
                </span>
              ))}
            </span>
            <Image src={KpiArrow} alt="" width={36} height={36} className="absolute right-4 top-24 max-md:top-4" />
          </span>
        )}
      </motion.span>

      {/* slide indicator stays put while the panels move */}
      {canFlip && <Dashes flipped={flipped} />}
    </button>
  );
}

const AFTER_DARK = new Set(["testimonial_slider_section", "industry_testimonials_section", "system_check_section"]);

// variant "icp" — Figma ICP Operating at scale "KPI's": note under the cards Light Italic 16/34
// #3F3E3C; before the light data-insight block the section keeps 72 below (72 + 72)
export default function HomeKpi({ data, lang = DEFAULT_LANG, variant }) {
  const icp = variant === "icp";
  const cards = rows(data?.cards).filter((c) => c.label || c.value);
  if (!data?.heading && cards.length === 0) return null;
  // subtitle: short_text (Page Builder) or sub_heading (Page Builder ICP Page); card.note renders inside KpiCard
  const subtitle = data.short_text || data.sub_heading;
  // note under the cards: bottom_text (Page Builder) or result_notes (Page Builder ICP Page)
  const bottomText = data.bottom_text || data.result_notes;

  return (
    // Homepage: the section above provides the top spacing (2px). After a dark section (ICP:
    // testimonial carousel) the KPI block starts its own 144px in, as in Figma "KPI's".
    // Mobile (Figma "USP big numbers"): 64 top after a dark section (else the section above gives it),
    // 64 bottom — 0 before the ICP data-insight block, which brings its own 64; heading → cards 48
    // (ICP: 40, with the body 16 under the H2 and the note + CTA 40 under the cards).
    <section className={`${AFTER_DARK.has(data?._prev) ? "pt-18 lg:pt-36 max-md:pt-16" : `lg:pt-[2px] ${data?._prev === "intro_video_section" ? "max-md:pt-16" : ""}`} ${icp && data?._next === "data_insight_section" ? "pb-12 lg:pb-[72px] max-md:pb-0" : "pb-18 lg:pb-36 max-md:pb-16"}`} style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className={`cs-container flex flex-col items-center gap-10 lg:gap-16 ${icp ? "" : "max-md:gap-12"}`}>
        {(data.heading || subtitle) && (
          <div className="flex flex-col items-center gap-4 text-center">
            {data.heading && (
              <h2 className="cs-h2 cs-highlight text-black max-w-[1179px]" dangerouslySetInnerHTML={{ __html: highlightHtml(data.heading, "lastLine") }} />
            )}
            {subtitle && (
              <div className="cs-rich max-w-[925px] text-[18px] lg:text-[24px] font-medium leading-7 tracking-[-0.48px] text-(--color-grey-dark) max-md:font-normal max-md:leading-[22px] max-md:tracking-[-0.36px]" dangerouslySetInnerHTML={{ __html: toHtml(subtitle) }} />
            )}
          </div>
        )}

        {cards.length > 0 && (
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-md:grid-cols-1">
            {cards.map((card, i) => (
              <KpiCard key={i} card={card} hint={data.flip_hint_text} />
            ))}
          </div>
        )}

        {(bottomText || (data.cta_text && data.cta_url)) && (
          <div className="flex max-w-[616px] flex-col items-center gap-6 text-center max-md:w-full">
            {bottomText && (
              <div className={`cs-rich text-(--color-grey-dark) ${icp ? "text-[16px] font-light italic leading-[34px] tracking-[-0.32px] max-md:text-[18px] max-md:font-normal max-md:leading-[22px] max-md:tracking-[-0.36px]" : "text-[18px] lg:text-[20px] font-medium leading-[26px] tracking-[-0.4px]"}`} dangerouslySetInnerHTML={{ __html: toHtml(bottomText) }} />
            )}
            {data.cta_text && data.cta_url && (
              <CtaButton href={langHref(data.cta_url.trim(), lang)} wrap className="max-w-full max-md:w-full">
                {data.cta_text}
              </CtaButton>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
