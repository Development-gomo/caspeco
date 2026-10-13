// src/components/sections/product/ProductResults.jsx
// ACF layout: results_section — "Results at all levels". Background photo with a
// 40% black overlay, a frosted dark card with a centred heading/text and two
// comparison columns (icon + coloured title + list of title/text rows).

import Image from "next/image";
import { mediaUrl, rows, toHtml } from "@/lib/content";

const TITLE_COLOR = { petrol: "text-(--color-petrol)", yellow: "text-(--color-yellow)", white: "text-(--color-light-grey)" };

function Column({ column }) {
  const icon = mediaUrl(column.icon);
  const items = rows(column.items).filter((i) => i.title);
  return (
    <div className="flex w-full flex-col gap-6 lg:max-w-[400px]">
      {column.title && (
        <div className="flex items-center gap-3">
          {icon && <Image src={icon} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />}
          <h3 className={`cs-h4 ${TITLE_COLOR[column.title_color] || TITLE_COLOR.petrol}`}>{column.title}</h3>
        </div>
      )}
      {items.length > 0 && (
        <ul className={`flex flex-col gap-4 ${icon ? "pl-11" : ""}`}>
          {items.map((item, i) => (
            <li key={i} className="flex flex-col">
              <span className="font-extrabold text-[18px] leading-[1.1] tracking-[-0.36px] text-(--color-light-grey)">{item.title}</span>
              {item.text && <span className="text-[14px] leading-4 tracking-[-0.28px] text-(--color-grey-medium)">{item.text}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductResults({ data }) {
  const columns = rows(data?.columns).filter((c) => c.title || rows(c.items).length);
  const { heading, short_text } = data || {};
  if (!heading && columns.length === 0) return null;
  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-16 lg:py-20">
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/40" aria-hidden />

      <div className="cs-container flex justify-center">
        <div className="flex w-full max-w-[1074px] flex-col items-center gap-12 rounded-[8px] bg-[rgba(21,20,17,0.3)] px-6 py-12 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:px-10 lg:gap-16 lg:p-20">
          <div className="flex max-w-[754px] flex-col items-center gap-4 text-center text-(--color-light-grey)">
            {heading && <h2 className="cs-h3 cs-highlight font-extrabold" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && (
              <div className="cs-rich font-medium text-[16px] leading-5 tracking-[-0.32px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />
            )}
          </div>

          {columns.length > 0 && (
            <div className="flex w-full flex-col gap-12 md:flex-row md:justify-center lg:gap-20">
              {columns.map((column, i) => (
                <Column key={i} column={column} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
