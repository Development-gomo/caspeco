// src/components/sections/inner-pages/BgGlassSection.jsx
// ACF layout: `bg_glass_effect_section` (Page Builder; renamed from `bg`) — "Why choose us".
// Fields: bg_image (image array), heading (textarea), short_text (textarea), columns
// (repeater, max 5: title_color petrol|yellow|white|orange, title, text textarea), card_position (right|left, default right; desktop only), bg_color.
// Full-bleed photo with a 40% black overlay and a frosted glass card pinned to the right of
// the container (md+; full width on mobile). Desktop: section padding 92, card 572 wide,
// padding 56, radius 12, 1px white@40 stroke, rgba(21,20,17,.35) fill + 40px backdrop blur,
// heading block 40 above a stacked list of items (coloured 22/26 Medium title, 4 gap, Bold
// 14/18 text) split by 1px dashed white dividers with 24 above / below. Mobile: section
// padding 64, card padding 40/24, radius 8, 32 gap, heading 32/36, item titles 20/24.

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// ACF "Title Colour" (same map as ProductResults); unknown/empty -> petrol
const TITLE_COLOR = { petrol: "text-(--color-petrol)", yellow: "text-(--color-yellow)", white: "text-(--color-light-grey)", orange: "text-[#FF8D6B]" };

export default function BgGlassSection({ data }) {
  const columns = rows(data?.columns).filter((c) => c.title || c.text).slice(0, 5);
  const { heading, short_text } = data || {};
  if (!heading && columns.length === 0) return null;
  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-black py-16 lg:py-[92px]" style={sectionBackground({ bg_color: data?.bg_color })}>
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/40" aria-hidden />

      <div className={`cs-container flex ${data?.card_position === "left" ? "md:justify-start" : "md:justify-end"}`}>
        {/* backdrop-blur sits on the Reveal itself: on a child of the opacity-animating wrapper the blur breaks */}
        <Reveal y={40} className="flex w-full flex-col gap-8 rounded-[8px] border border-white/40 bg-[rgba(21,20,17,0.35)] px-6 py-10 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[40px] md:max-w-[572px] md:gap-10 md:rounded-[12px] md:p-14">
          <div className="flex flex-col gap-4 text-(--color-light-grey)">
            {heading && <h2 className="cs-highlight font-bold text-[32px] leading-[36px] tracking-[-0.64px] md:text-[40px] md:leading-[44px] md:tracking-[-0.8px]" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className="cs-rich cs-list font-medium text-[16px] leading-5 tracking-[-0.32px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {columns.length > 0 && (
            <ul className="flex flex-col">
              {columns.map((c, i) => (
                // 24 above / below each dashed divider; none above the first or below the last item
                <Reveal as="li" key={i} y={12} delay={0.25 + i * 0.1} className="flex flex-col gap-1 py-6 first:pt-0 last:pb-0 not-first:border-t not-first:border-dashed not-first:border-white">
                  {c.title && (
                    <h3 className={`font-medium text-[20px] leading-6 tracking-[-0.4px] md:text-[22px] md:leading-[26px] md:tracking-[-0.44px] ${TITLE_COLOR[c.title_color] || TITLE_COLOR.petrol}`}>{c.title}</h3>
                  )}
                  {c.text && <div className="cs-rich cs-list font-bold text-[14px] leading-[18px] tracking-[-0.28px] text-(--color-light-grey)" dangerouslySetInnerHTML={{ __html: toHtml(c.text) }} />}
                </Reveal>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </section>
  );
}
