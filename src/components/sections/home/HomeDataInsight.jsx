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

function Chart({ title, rows: chartRows }) {
  return (
    <div
      className="w-full xl:w-[614px] shrink-0 rounded-[8px] border border-white/10 px-6 pt-6 pb-8 lg:px-9 lg:pt-[33px] lg:pb-[28px] shadow-[0px_5.333px_16px_0px_rgba(0,0,0,0.16)] backdrop-blur-sm"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 0% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 49%, rgba(218,220,221,0.2) 100%)",
      }}
    >
      {title && <p className="font-medium text-[20px] lg:text-[24px] leading-6 tracking-[-0.48px] text-(--color-light-grey)">{title}</p>}
      <div className="mt-6 lg:mt-[27px] flex flex-col gap-[30px]">
        {chartRows.map((row, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4 text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px]">
              <span className="text-(--color-grey-medium)">{row.label}</span>
              <span className="font-extrabold text-(--color-light-grey) whitespace-nowrap">{row.value_label}</span>
            </div>
            <div className="h-[25px] w-full overflow-hidden rounded-[4px] bg-[rgba(0,0,0,0.22)]">
              <motion.div
                className="h-full rounded-[4px]"
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

export default function HomeDataInsight({ data }) {
  const usps = rows(data?.usps).filter((u) => u.title);
  const chartRows = rows(data?.chart_rows).filter((r) => r.label);
  const [open, setOpen] = React.useState(false);
  const { heading, card_heading, short_text, read_more_text, read_more_content, chart_title } = data || {};
  if (!heading && !card_heading) return null;

  return (
    <section
      className="pt-18 pb-12 lg:pt-36 lg:pb-[72px]"
      style={sectionBackground(data, { background: "var(--color-light-grey)" })}
    >
      <div className="cs-container flex flex-col items-center gap-10 lg:gap-16">
        {heading && (
          <h2 className="cs-h2 cs-highlight cs-rich text-center text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}

        <div
          className="flex w-full flex-col gap-10 overflow-hidden rounded-[16px] p-6 md:p-10 lg:p-[72px] xl:min-h-[608px] xl:flex-row xl:items-start xl:justify-between xl:gap-2"
          style={{ backgroundImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, #0b2533 0%, #0b2533 100%)" }}
        >
          <div className="flex min-w-0 flex-col items-start text-(--color-light-grey) xl:max-w-[507px] xl:flex-1">
            <div className="flex flex-col gap-5">
              {card_heading && <h3 className="cs-h3">{card_heading}</h3>}
              {short_text && (
                <p className="font-bold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] lg:max-w-[446px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />
              )}
            </div>

            {usps.length > 0 && (
              <ul className="mt-4 flex flex-col">
                {usps.map((usp, i) => (
                  <li key={i} className="flex items-center gap-[10px] py-[18px] -mb-4 last:mb-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[26px] bg-(--color-yellow)">
                      {mediaUrl(usp.icon) && <Image src={mediaUrl(usp.icon)} alt="" width={18} height={18} />}
                    </span>
                    <span className="flex flex-col">
                      <span className="font-extrabold text-[18px] leading-[1.1] tracking-[-0.36px]">{usp.title}</span>
                      {usp.text && <span className="font-bold text-[14px] leading-4 tracking-[-0.28px]">{usp.text}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {read_more_text && read_more_content && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpen((o) => !o)}
                  aria-expanded={open}
                  className="flex cursor-pointer items-center gap-4 font-bold text-[16px] leading-5 tracking-[-0.32px] underline"
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
              <Chart title={chart_title} rows={chartRows} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
