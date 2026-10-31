// src/components/sections/case-study/ChallengeCards.jsx
// ACF layout: challenges_and_solution ("Challenge Solution Section") on case studies.
// Heading + intro text over the section photo (bg_image, dark overlay) and a row of glass cards
// (same Figma glass as the testimonial cards): yellow icon circle, yellow uppercase label,
// "01 / 02 / 03" counter and the text. Three cards sit side by side on desktop, two on tablet,
// one on mobile. Colours, type sizes and paddings are the site's standard section styles.

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { GLASS_CLASS, GLASS_STYLE } from "@/components/ui/glass";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const pad = (n) => String(n).padStart(2, "0");

function Card({ item, index }) {
  const icon = mediaUrl(item.icon);
  return (
    <Reveal
      delay={0.1 + index * 0.08}
      // no ancestor may use opacity < 1, filter or clip-path or the glass blur sees nothing (Reveal
      // only animates once in view; the glass class sits on the inner element)
      className="h-full"
    >
      <article className={`flex h-full flex-col gap-6 rounded-[8px] p-6 text-(--color-light-grey) lg:p-8 max-md:gap-4 ${GLASS_CLASS}`} style={GLASS_STYLE}>
        <header className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            {icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--color-yellow)">
                <Image src={icon} alt="" width={18} height={18} className="size-[18px] object-contain brightness-0" />
              </span>
            )}
            {item.label && <h3 className="text-[14px] font-bold uppercase leading-4 tracking-[0.6px] text-(--color-yellow)">{item.label}</h3>}
          </span>
          <span className="text-[14px] font-medium leading-5 tracking-[0.1px] text-(--color-grey-medium)" aria-hidden>
            {pad(index + 1)}
          </span>
        </header>
        {item.text && (
          <div className="cs-rich cs-text font-light max-md:font-normal text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px] lg:leading-6" dangerouslySetInnerHTML={{ __html: toHtml(item.text) }} />
        )}
      </article>
    </Reveal>
  );
}

export default function ChallengeCards({ data }) {
  const items = rows(data?.cards).filter((c) => c.label || c.text);
  const { heading, sub_heading } = data || {};
  if (!heading && !sub_heading && items.length === 0) return null;
  const hasPhoto = Boolean(mediaUrl(data?.bg_image));

  return (
    <section className="cs-sec relative isolate overflow-hidden py-18 lg:py-36 text-white" style={sectionBackground(data, { background: "var(--color-black)" })}>
      {hasPhoto && <span className="absolute inset-0 -z-10 bg-black/60" aria-hidden />}
      <div className="cs-container flex flex-col gap-10 max-md:gap-8 lg:gap-16">
        {(heading || sub_heading) && (
          <Reveal className="flex flex-col gap-6">
            {heading && <h2 className="cs-h2 cs-highlight cs-rich max-w-[900px] text-white" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {sub_heading && <div className="cs-p2 cs-rich max-w-[680px] text-(--color-light-grey)" dangerouslySetInnerHTML={{ __html: toHtml(sub_heading) }} />}
          </Reveal>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 max-md:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card key={i} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
