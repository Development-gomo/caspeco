// src/components/sections/home/HomeKpi.jsx
// ACF layout: home_kpi_section — "Best-performing customers last month" flip cards.
// Front: label + stat. Back: checklist (back_items). The yellow arrow (or the card) flips it.

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import KpiArrow from "../../../../public/icons/home/kpi-arrow.svg";
import CircleInfo from "../../../../public/icons/home/circle-info.svg";
import CheckYellow from "../../../../public/icons/home/check-yellow.svg";
import { highlightHtml, rows, sectionBackground } from "@/lib/content";

function Dashes({ flipped }) {
  return (
    <span className="absolute right-4 bottom-[12px] flex gap-[5.5px]" aria-hidden>
      <span className={`h-[2px] w-[24.75px] rounded-[1.4px] ${flipped ? "bg-(--color-light-grey)" : "bg-(--color-yellow)"}`} />
      <span className={`h-[2px] w-[24.75px] rounded-[1.4px] ${flipped ? "bg-(--color-yellow)" : "bg-(--color-light-grey)"}`} />
    </span>
  );
}

function KpiCard({ card, hint }) {
  const [flipped, setFlipped] = React.useState(false);
  const backItems = rows(card.back_items).map((r) => r.text).filter(Boolean);
  const canFlip = backItems.length > 0;

  const face =
    "absolute inset-0 rounded-[8px] bg-(--color-dark-petrol) text-(--color-light-grey) [backface-visibility:hidden] drop-shadow-[0px_4px_6px_rgba(0,0,0,0.16)]";

  return (
    <button
      type="button"
      onClick={() => canFlip && setFlipped((f) => !f)}
      aria-pressed={canFlip ? flipped : undefined}
      className={`relative h-[228px] w-full text-left [perspective:1200px] ${canFlip ? "cursor-pointer" : "cursor-default"}`}
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* FRONT */}
        <span className={face}>
          <span className="absolute left-6 top-6 max-w-[150px] text-[20px] leading-6 tracking-[-0.4px]">{card.label}</span>
          <span className="absolute left-6 top-[84px] font-bold text-[64px] leading-[64px] tracking-[-1.28px] sm:text-[80px] sm:tracking-[-1.6px]">
            {card.value}
          </span>
          {canFlip && <Image src={KpiArrow} alt="" width={36} height={36} className="absolute right-4 top-24" />}
          {hint && (
            <span className="absolute left-[22px] bottom-[9px] flex items-center gap-1 text-[12px] leading-5 tracking-[0.1px] italic font-light text-[rgba(251,250,249,0.8)]">
              <Image src={CircleInfo} alt="" width={16} height={16} />
              {hint}
            </span>
          )}
          {canFlip && <Dashes flipped={false} />}
        </span>

        {/* BACK */}
        {canFlip && (
          <span className={`${face} [transform:rotateY(180deg)]`}>
            <span className="absolute left-[22px] right-[64px] top-[46px] flex flex-col gap-[10px]">
              {backItems.map((text, i) => (
                <span key={i} className="flex items-start gap-2 text-[16px] leading-5 tracking-[0.1px] text-(--color-white)">
                  <Image src={CheckYellow} alt="" width={14} height={16} className="mt-0.5 shrink-0" />
                  {text}
                </span>
              ))}
            </span>
            <Image src={KpiArrow} alt="" width={36} height={36} className="absolute right-4 top-24" />
            <Dashes flipped />
          </span>
        )}
      </motion.span>
    </button>
  );
}

export default function HomeKpi({ data }) {
  const cards = rows(data?.cards).filter((c) => c.label || c.value);
  if (!data?.heading && cards.length === 0) return null;

  return (
    <section className="pb-18 lg:pb-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col items-center gap-10 lg:gap-16">
        {data.heading && (
          <h2
            className="cs-h2 cs-highlight text-center text-(--color-black) max-w-[925px]"
            dangerouslySetInnerHTML={{ __html: highlightHtml(data.heading, "lastLine") }}
          />
        )}

        {cards.length > 0 && (
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <KpiCard key={i} card={card} hint={data.flip_hint_text} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
