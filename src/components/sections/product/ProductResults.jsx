// src/components/sections/product/ProductResults.jsx
// ACF layout: results_section — "Results at all levels". Background photo with a
// 40% black overlay, a frosted dark card with a centred heading/text and two
// comparison columns (icon + coloured title + list of title/text rows).
// Mobile (< 768, Figma Product "Mobile comparison block" / ICP Adding locations 2516:12461):
// section padding 64, panel padding 32, radius 4, 1px white@12 stroke, left-aligned
// heading + intro (18/22, Light; Regular on ICP), 24px-high icons (own width: 24 house, 18 building), no list indent, a 1px #FDFDFD@15
// divider on top of each column (24 above the title; ICP: 24 / 12, columns 16 apart). Figma's
// strokes are inside (no layout space), so the CSS 1px borders take 1px off the padding.

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { mediaUrl, rows, toHtml } from "@/lib/content";

// ACF "Title Colour"; orange = Figma "Reduce" title on the ICP Comparison block (#FF8D6B)
const TITLE_COLOR = { petrol: "text-(--color-petrol)", yellow: "text-(--color-yellow)", white: "text-(--color-light-grey)", orange: "text-[#FF8D6B]" };

function Column({ column, index, icp }) {
  const icon = mediaUrl(column.icon);
  const items = rows(column.items).filter((i) => i.title);
  return (
    // ICP: Figma columns 400 + 80 + 408 (888 row, the second column fills the rest)
    <Reveal
      delay={0.25 + index * 0.15}
      className={`flex w-full flex-col gap-6 max-md:gap-4 max-md:border-t max-md:border-[rgba(253,253,253,0.15)] max-md:pt-[23px] ${icp ? "max-md:not-first:pt-[11px] lg:w-[400px] lg:last:w-auto lg:last:flex-1" : "lg:max-w-[400px]"}`}
    >
      {column.title && (
        <div className="flex items-center gap-3 max-md:gap-2.5">
          {icon && <Image src={icon} alt="" width={32} height={32} className="size-8 shrink-0 object-contain max-md:h-6! max-md:w-auto!" />}
          <h3 className={`cs-h4 ${TITLE_COLOR[column.title_color] || TITLE_COLOR.petrol}`}>{column.title}</h3>
        </div>
      )}
      {items.length > 0 && (
        <ul className={`flex flex-col gap-4 ${icon ? "pl-11 max-md:pl-0" : ""}`}>
          {items.map((item, i) => (
            <Reveal as="li" key={i} y={12} delay={0.4 + index * 0.15 + i * 0.08} className="flex flex-col max-md:gap-0.5">
              <span className="font-extrabold text-[18px] leading-[1.1] tracking-[-0.36px] text-(--color-light-grey)">{item.title}</span>
              {item.text && <span className="text-[14px] leading-4 tracking-[-0.28px] text-(--color-grey-medium)">{item.text}</span>}
            </Reveal>
          ))}
        </ul>
      )}
    </Reveal>
  );
}

// variant "icp" — Figma "Comparison block" (ICP Adding locations, 324:7005): card 1048 wide,
// heading X-Bold in an 826 box (text 754), columns row 888, bold bottom note under the columns
export default function ProductResults({ data, variant }) {
  const icp = variant === "icp";
  const columns = rows(data?.columns).filter((c) => c.title || rows(c.items).length);
  const { heading, short_text, bottom_note } = data || {};
  if (!heading && columns.length === 0) return null;
  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-black py-16 lg:py-20">
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/40" aria-hidden />

      <div className="cs-container flex justify-center">
        <Reveal y={40} className={`flex w-full ${icp ? "max-w-[1048px]" : "max-w-[1040px]"} flex-col items-center gap-12 rounded-[8px] bg-[rgba(21,20,17,0.3)] px-6 py-12 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:px-10 lg:gap-16 lg:p-20 max-md:items-stretch max-md:rounded-[4px] max-md:border max-md:border-white/12 max-md:p-[31px]! max-md:shadow-[0px_8px_30px_rgba(0,0,0,0.6),0px_4px_4px_rgba(0,0,0,0.25)] ${icp ? "max-md:gap-6" : ""}`}>
          <div className={`flex flex-col items-center gap-4 text-center text-(--color-light-grey) max-md:items-start max-md:text-left ${icp ? "max-w-[826px]" : "max-w-[754px]"}`}>
            {heading && <h2 className={`cs-h3 cs-title cs-highlight ${icp ? "font-extrabold!" : "font-extrabold"}`} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && (
              <div className={`cs-rich max-w-[754px] font-medium text-[16px] leading-5 tracking-[-0.32px] max-md:text-[18px] max-md:leading-[22px] max-md:tracking-[-0.36px] max-md:hidden ${icp ? "max-md:font-normal" : "max-md:font-light"}`} dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />
            )}
          </div>

          {columns.length > 0 && (
            <div className={`flex w-full flex-col gap-12 md:flex-row md:justify-center lg:gap-20 ${icp ? "max-md:gap-4 lg:w-[888px]" : "max-md:gap-6"}`}>
              {columns.map((column, i) => (
                <Column key={i} column={column} index={i} icp={icp} />
              ))}
            </div>
          )}

          {bottom_note && (
            // Figma: Bold 16/20 #FDFDFD, 754 wide, 64 below the columns
            <p className="max-w-[754px] text-center font-bold text-[16px] leading-5 tracking-[-0.32px] text-(--color-light-grey) max-md:text-left max-md:leading-[1.1]">{bottom_note}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
