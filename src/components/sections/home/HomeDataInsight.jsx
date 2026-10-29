// src/components/sections/home/HomeDataInsight.jsx
// ACF layout: data_insight_section — "Turn data into profitability" dark card with
// USPs, a "Read more" accordion and an "Industry average" bar chart that fills on scroll.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ChevronDown from "../../../../public/icons/home/chevron-down.svg";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// Bar fills from the Figma chart, top to bottom (repeats after four rows)
const BAR_COLORS = ["var(--color-yellow)", "var(--color-yellow-dark-bg)", "var(--color-yellow-light-bg)", "var(--color-light-grey)"];

// Bar width: explicit bar_percent, else the highest number in the label ("2 - 6%" → 6)
function barPercent(row) {
  const explicit = parseFloat(row.bar_percent);
  if (Number.isFinite(explicit)) return Math.min(100, Math.max(0, explicit));
  const nums = String(row.value_label || "").match(/\d+(?:[.,]\d+)?/g);
  return nums ? Math.min(100, Math.max(...nums.map((n) => parseFloat(n.replace(",", "."))))) : 0;
}

// "Value Label" is an ACF number field (31) → shown as "31%" like Figma; text values ("2 - 6%") as entered
const valueText = (v) => { const t = String(v ?? "").trim(); return /^-?\d+(?:[.,]\d+)?$/.test(t) ? `${t}%` : t; };

// Mobile (Figma "Industry average"): 20px sides, 24 top/bottom (inside the 1px border), heading Medium 22/24 (box 5px further in),
// heading -> first row 18, category Regular 16/24 #DADCDD, value X-Bold 18, bar 4 below the text, 16 tall,
// rows 20 apart
function Chart({ title, rows: chartRows, rowGap = "gap-[30px]" }) {
  return (
    <div
      className="w-full xl:w-[614px] shrink-0 rounded-[8px] border border-white/10 px-6 pt-6 pb-8 lg:px-9 lg:pt-[33px] lg:pb-[28px] max-md:px-[19px] max-md:pt-[23px] max-md:pb-[23px] shadow-[0px_5.333px_16px_0px_rgba(0,0,0,0.16)] backdrop-blur-sm"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 0% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 49%, rgba(218,220,221,0.2) 100%)",
      }}
    >
      {title && <p className="font-medium text-[20px] lg:text-[24px] leading-6 tracking-[-0.48px] text-(--color-light-grey) max-md:pl-[5px] max-md:text-[22px] max-md:tracking-[-0.44px]">{title}</p>}
      <div className={`mt-6 lg:mt-[26px] flex flex-col ${rowGap} max-md:mt-[18px] max-md:gap-5`}>
        {chartRows.map((row, i) => (
          <div key={i} className="flex flex-col gap-3 max-md:gap-1">
            <div className="flex items-baseline justify-between gap-4 text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] max-md:text-[16px] max-md:tracking-[-0.32px]">
              <span className="text-(--color-grey-medium)">{row.label}</span>
              <span className="font-extrabold text-(--color-light-grey) whitespace-nowrap max-md:text-[18px] max-md:tracking-normal">{valueText(row.value_label)}</span>
            </div>
            <div className="h-[25px] w-full overflow-hidden rounded-sm bg-[rgba(0,0,0,0.22)] max-md:h-4">
              <motion.div
                className="h-full rounded-sm"
                style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                initial={{ width: 0 }}
                whileInView={{ width: `${barPercent(row)}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 1.1, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// variant "icp" — Figma ICP Adding locations "Turn data into profitability" (324:7050): chart rows
// 18 apart (card 410 tall) and 144 below the card (followed by the dark testimonials)
export default function HomeDataInsight({ data, variant }) {
  const icp = variant === "icp";
  const usps = rows(data?.usps).filter((u) => u.title);
  const chartRows = rows(data?.chart_rows).filter((r) => r.label);
  const [open, setOpen] = React.useState(false);
  const { heading, card_heading, sub_heading, read_more_text, read_more_content, chart_title } = data || {};
  if (!heading && !card_heading) return null;

  return (
    // Mobile (Figma Home "Frame 8934297" 601:9172): 64 top and bottom (cs-sec), H2 -> card 40 (ICP 32);
    // card 32/24 padding, blocks 32 apart. Content hidden on mobile: the intro paragraph and the USP icons /
    // descriptions — the USPs show as yellow-check lines (X-Bold 18/22, 8 apart, check 8 before the label)
    <section
      className={`cs-sec ${icp && data?._prev === "home_kpi_section" ? "pt-12 lg:pt-[72px]" : "pt-18 lg:pt-36"} ${icp ? "pb-18 lg:pb-36" : "pb-12 lg:pb-[72px]"}`}
      style={sectionBackground(data, { background: "var(--color-light-grey)" })}
    >
      <div className={`cs-container flex flex-col items-center gap-10 lg:gap-16 ${icp ? "max-md:gap-8" : ""}`}>
        {heading && (
          <h2 className="cs-h2 cs-highlight cs-rich text-center text-(--color-heading) max-md:text-(--color-black)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}

        <div
          className="flex w-full flex-col gap-10 overflow-hidden rounded-2xl p-6 md:p-10 lg:p-[72px] xl:min-h-[608px] xl:flex-row xl:items-start xl:justify-between xl:gap-2 max-md:gap-8 max-md:py-8"
          style={{ backgroundImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, #0b2533 0%, #0b2533 100%)" }}
        >
          <div className="flex min-w-0 flex-col items-start text-(--color-light-grey) xl:max-w-[507px] xl:flex-1">
            <div className="flex flex-col gap-5">
              {card_heading && <h3 className="cs-h3 cs-card-title max-md:text-white">{card_heading}</h3>}
              {sub_heading && (
                <div className="cs-rich font-bold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] lg:max-w-[446px] max-md:hidden" dangerouslySetInnerHTML={{ __html: toHtml(sub_heading) }} />
              )}
            </div>

            {usps.length > 0 && (
              <ul className="mt-4 flex flex-col max-md:mt-8 max-md:gap-2">
                {usps.map((usp, i) => (
                  <li key={i} className="flex items-center gap-2.5 py-[18px] -mb-4 last:mb-0 max-md:items-start max-md:gap-2 max-md:py-0 max-md:mb-0">
                    {/* mobile: Figma yellow check (14×16) instead of the icon circle */}
                    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden className="mt-0.5 hidden shrink-0 max-md:block">
                      <path transform="translate(0.125 3.289)" fill="#FFC120" d="M 12.616594241538177 0.17914942873225426 C 13.031561288065681 0.47905929538482106 13.124421046729179 1.0558092166133648 12.822626831072812 1.468185300144101 L 5.393846137993005 11.618981277245847 C 5.234243427790119 11.83814618707252 4.987584693840203 11.973682334211476 4.714809152766179 11.996752325252709 C 4.442033611692155 12.019822316293942 4.177963672992833 11.91889113039165 3.9864404207493696 11.728563718652419 L 0.27205007420946564 8.037365692325823 C -0.09068335806982186 7.6768970810403045 -0.09068335806982186 7.091494955457208 0.27205007420946564 6.73102634417169 C 0.6347835064887531 6.370557732886172 1.2238627092433594 6.370557732886172 1.5865961415226468 6.73102634417169 L 4.531991502897418 9.658031461326853 L 11.322362225030025 0.3810118343037554 C 11.624156440686392 -0.03136424922698078 12.204529062468907 -0.12364414585808373 12.619496108996412 0.17626572079448308 L 12.616594241538177 0.17914942873225426 Z" />
                    </svg>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[26px] bg-(--color-yellow) max-md:hidden">
                      {mediaUrl(usp.icon) && <Image src={mediaUrl(usp.icon)} alt="" width={18} height={18} />}
                    </span>
                    <span className="flex flex-col max-md:gap-1.5">
                      <span className={`font-extrabold text-[18px] leading-[1.1] tracking-[-0.36px] max-md:text-white ${i === 0 ? "max-md:leading-6" : "max-md:leading-[22px]"}`}>{usp.title}</span>
                      {usp.text && <span className="font-bold text-[14px] leading-4 tracking-[-0.28px] max-md:hidden">{usp.text}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {read_more_text && read_more_content && (
              <div className="mt-4 max-md:mt-8">
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  aria-expanded={open}
                  className="flex cursor-pointer items-center gap-4 font-bold text-[16px] leading-5 tracking-[-0.32px] underline max-md:h-8"
                >
                  {read_more_text}
                  <Image src={ChevronDown} alt="" width={12} height={8} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="cs-rich pt-4 text-[16px] leading-[22px]" dangerouslySetInnerHTML={{ __html: toHtml(read_more_content) }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {chartRows.length > 0 && (
            <div className="w-full xl:w-auto xl:pt-[18px]">
              <Chart title={chart_title} rows={chartRows} rowGap={icp ? "gap-[18px]" : undefined} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
