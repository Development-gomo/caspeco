// src/components/sections/industry/IndustryResults.jsx
// ACF layout: industry_results_section — Figma "What restaurants achieve with Caspeco".
// Heading and up to 4 dark result cards (306×256): outcome label, big result,
// description and a source line (e.g. the venue).
// Motion: cards reveal on scroll (staggered), results count up, cards lift on hover.

import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { rows, sectionBackground, toHtml } from "@/lib/content";

export default function IndustryResults({ data }) {
  const cards = rows(data?.cards).filter((c) => c.result || c.outcome);
  const { heading } = data || {};
  if (!heading && cards.length === 0) return null;

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {heading && (
          <Reveal as="h2" className="cs-h2 cs-highlight cs-rich max-w-[985px] text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}

        {cards.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, i) => (
              <Reveal
                key={i}
                delay={0.1 + i * 0.08}
                className="flex min-h-[256px] flex-col justify-between gap-8 rounded-[8px] bg-(--color-dark-petrol) p-6 text-(--color-light-grey) shadow-[0px_4px_6px_0px_rgba(0,0,0,0.16)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_24px_0px_rgba(0,0,0,0.25)]"
              >
                {card.outcome && <p className="text-[18px] lg:text-[20px] leading-5 tracking-[-0.4px]">{card.outcome}</p>}
                <div className="flex flex-col gap-2">
                  {card.result && (
                    <p className="font-bold text-[48px] leading-[56px] tracking-[-1.44px] text-(--color-yellow) lg:text-[56px]"><CountUp value={card.result} /></p>
                  )}
                  {card.text && (
                    <div className="cs-rich text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px]" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />
                  )}
                  {card.source && <p className="mt-4 text-[14px] lg:text-[16px] italic font-light leading-6 text-(--color-grey-medium)">{card.source}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
