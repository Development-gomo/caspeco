// src/components/sections/product/ProductResults.jsx
// ACF layout: results_section — "Results at all levels". Background photo with a
// 40% black overlay, a frosted dark card with a centred heading/text and two
// comparison columns (icon + coloured title + list of title/text rows).

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
    <Reveal delay={0.25 + index * 0.15} className={`flex w-full flex-col gap-6 ${icp ? "lg:w-[400px] lg:last:w-auto lg:last:flex-1" : "lg:max-w-[400px]"}`}>
      {column.title && (
        <div className="flex items-center gap-3">
          {icon && <Image src={icon} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />}
          <h3 className={`cs-h4 ${TITLE_COLOR[column.title_color] || TITLE_COLOR.petrol}`}>{column.title}</h3>
        </div>
      )}
      {items.length > 0 && (
        <ul className={`flex flex-col gap-4 ${icon ? "pl-11" : ""}`}>
          {items.map((item, i) => (
            <Reveal as="li" key={i} y={12} delay={0.4 + index * 0.15 + i * 0.08} className="flex flex-col">
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
        <Reveal y={40} className={`flex w-full ${icp ? "max-w-[1048px]" : "max-w-[1040px]"} flex-col items-center gap-12 rounded-[8px] bg-[rgba(21,20,17,0.3)] px-6 py-12 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:px-10 lg:gap-16 lg:p-20`}>
          <div className={`flex flex-col items-center gap-4 text-center text-(--color-light-grey) ${icp ? "max-w-[826px]" : "max-w-[754px]"}`}>
            {heading && <h2 className={`cs-h3 cs-highlight ${icp ? "font-extrabold!" : "font-extrabold"}`} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && (
              <div className="cs-rich max-w-[754px] font-medium text-[16px] leading-5 tracking-[-0.32px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />
            )}
          </div>

          {columns.length > 0 && (
            <div className={`flex w-full flex-col gap-12 md:flex-row md:justify-center lg:gap-20 ${icp ? "lg:w-[888px]" : ""}`}>
              {columns.map((column, i) => (
                <Column key={i} column={column} index={i} icp={icp} />
              ))}
            </div>
          )}

          {bottom_note && (
            // Figma: Bold 16/20 #FDFDFD, 754 wide, 64 below the columns
            <p className="max-w-[754px] text-center font-bold text-[16px] leading-5 tracking-[-0.32px] text-(--color-light-grey)">{bottom_note}</p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
