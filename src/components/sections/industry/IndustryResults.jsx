// src/components/sections/industry/IndustryResults.jsx
// ACF layout: industry_results_section — Figma "What restaurants achieve with Caspeco".
// Centred heading (second line yellow via <span>/<strong>) and up to 4 result cards
// (306×256): optional photo (bg_image) behind a dark overlay, outcome label, big white result,
// description and a yellow source line (e.g. the venue).
// Motion: cards reveal on scroll (staggered), results count up, cards lift on hover and
// the photo zooms slightly.
// Mobile (< 768, final Figma Industry 601:10153): padding 64, 48 under the H2, cards 156 tall stacked
// 16 apart, padding 12/24/16, blurred photo; outcome Regular 16/22 top left, yellow source top right,
// result X-Bold 54/102% -2%, 8, description Regular 18/22 -2%.

import Image from "next/image";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const GRADIENT = "linear-gradient(180deg, #f2f2f2 0%, #fdfdfd 100%)";

export default function IndustryResults({ data }) {
  const cards = rows(data?.cards).filter((c) => c.result || c.outcome);
  const { heading } = data || {};
  if (!heading && cards.length === 0) return null;

  return (
    <section className="cs-sec py-18 lg:py-36" style={sectionBackground(data, { backgroundImage: GRADIENT })}>
      <div className="cs-container flex flex-col gap-10 max-md:gap-12 lg:gap-16">
        {heading && (
          <Reveal as="h2" className="cs-h2 cs-highlight cs-rich mx-auto max-w-[985px] text-center text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}

        {cards.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-md:grid-cols-1! lg:grid-cols-4">
            {cards.map((card, i) => {
              const image = mediaUrl(card.bg_image) || mediaUrl(card.image);
              return (
                <Reveal
                  key={i}
                  delay={0.1 + i * 0.08}
                  className="group relative isolate flex min-h-[256px] flex-col justify-between gap-8 overflow-hidden rounded-[8px] bg-(--color-black) p-6 text-(--color-light-grey) shadow-[0px_4px_6px_0px_rgba(0,0,0,0.16)] max-md:min-h-[156px] max-md:justify-start max-md:gap-0 max-md:px-6 max-md:pt-3 max-md:pb-4 max-md:shadow-none transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_24px_0px_rgba(0,0,0,0.25)]"
                >
                  {image && (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 306px, (min-width: 640px) 50vw, 100vw"
                      className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-105 max-md:scale-110 max-md:blur-[4px] max-md:group-hover:scale-110"
                    />
                  )}
                  <span className="absolute inset-0 -z-10 bg-black/65" aria-hidden />

                  {/* mobile: the yellow source sits top right (Figma), the desktop one stays under the text */}
                  {card.source && <p className="absolute top-3 right-6 z-0 max-w-[139px] text-right text-[14px] leading-6 tracking-[0.15px] text-(--color-yellow) md:hidden">{card.source}</p>}
                  {card.outcome && <p className="text-[18px] lg:text-[20px] leading-5 tracking-[-0.4px] max-md:-mb-px max-md:text-[16px] max-md:leading-[22px] max-md:tracking-[-0.32px]">{card.outcome}</p>}
                  <div className="flex flex-col gap-2">
                    {card.result && (
                      <p className="font-extrabold text-[48px] leading-[56px] tracking-[-1.92px] max-md:text-[54px] max-md:leading-[55.08px] max-md:tracking-[-1.08px] lg:text-[54px] lg:tracking-[-2.16px]">
                        <CountUp value={card.result} />
                      </p>
                    )}
                    {card.text && (
                      <div className="cs-rich text-[16px] lg:text-[18px] font-light leading-[22px] tracking-normal max-md:text-[18px] max-md:font-normal max-md:tracking-[-0.36px]" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />
                    )}
                    {card.source && <p className="mt-4 text-[14px] leading-6 tracking-[0.15px] text-(--color-yellow) max-md:hidden">{card.source}</p>}
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
