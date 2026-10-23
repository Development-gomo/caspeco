// src/components/sections/icp/SystemCheck.jsx
// ACF layout: system_check_section — Figma "Everything your restaurant needs" (ICP pages).
// Values from Figma (frame 1512×547):
//  - background: photo with 24.8px layer blur, black gradient left→right 100% → 40%
//  - left: eyebrow Regular Italic 20/26 -4% #FFC120, H Bold 54/56 -4% #FDFDFD,
//    text Bold 20/24 -2% #FDFDFD (20 below), CTA (40 below); column 507 wide
//  - right: glass card 701 wide, radius 8, padding 32: title Regular Italic 32/42.8 -2% with a
//    hand-drawn #FFC120 2px underline, subtitle Light Italic 16/34 -2% #FDFDFD@80%, checklist
//    Medium 20/32 -2% with 18px white tick boxes, rows 10 apart
//  - card 80 from the top, 90 from the bottom; text column vertically centred on the card

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import { GLASS_CLASS, GLASS_STYLE } from "@/components/ui/glass";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, toHtml } from "@/lib/content";

// Figma "Success" — 18px #FDFDFD box (radius 3) with a #3F3E3C check
function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="mt-2 shrink-0">
      <rect width="18" height="18" rx="3" fill="#FDFDFD" />
      <path d="M13.1 5.1c.25.28.25.7 0 .96l-7.4 7.4a.68.68 0 0 1-.96 0L1.9 10.62" transform="translate(1.6 -0.6)" fill="none" stroke="#3F3E3C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Figma "Line 405": 364×4, 2px #FFC120, round caps — exact path; starts 12px in from the title
function Underline() {
  return (
    <svg viewBox="-1 -1 366 6" preserveAspectRatio="none" aria-hidden className="absolute left-3 top-10 h-[6px] w-[calc(94.8%+2px)] overflow-visible">
      <path d="M 0 4 C 0 4 82.38 0.76 135.31 0.14 C 224.63 -0.89 363.96 4 363.96 4" fill="none" stroke="#FFC120" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function SystemCheck({ data, lang = DEFAULT_LANG }) {
  const items = rows(data?.checklist).map((r) => r.item || r.text).filter(Boolean);
  const { eyebrow, heading, cta_text, cta_url, card_title, card_subtitle } = data || {};
  const text = data?.text || data?.short_text; // short_text in "Page Builder ICP Page"
  if (!heading && items.length === 0) return null;
  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-18 lg:pt-20 lg:pb-[90px]" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {/* photo with Figma layer blur (scaled so the blurred edge stays outside the section) */}
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 scale-110 object-cover blur-[24.8px]" />}
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(90deg, #000 -0.9%, rgba(0, 0, 0, 0.4) 100.9%)" }} aria-hidden />

      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <Reveal className="flex flex-col items-start gap-10 lg:max-w-[507px]">
          <div className="flex flex-col gap-5 text-(--color-white)">
            <div className="flex flex-col">
              {eyebrow && <p className="italic font-normal text-[18px] lg:text-[20px] leading-[26px] tracking-[-0.8px] text-(--color-yellow)">{eyebrow}</p>}
              {heading && <h2 className="cs-h3 cs-highlight cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            </div>
            {text && (
              <div className="cs-rich max-w-[446px] font-bold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px]" dangerouslySetInnerHTML={{ __html: toHtml(text) }} />
            )}
          </div>
          {cta_text && cta_url && (
            <CtaButton href={langHref(cta_url.trim(), lang)} wrap className="max-w-full">
              {cta_text}
            </CtaButton>
          )}
        </Reveal>

        {(card_title || items.length > 0) && (
          <Reveal
            x={40}
            y={0}
            delay={0.15}
            className={`w-full rounded-[8px] p-6 text-(--color-white) sm:p-8 lg:w-[701px] lg:flex-none ${GLASS_CLASS}`}
            style={GLASS_STYLE}
          >
            {card_title && (
              <p className="relative inline-block pb-2 italic font-normal text-[26px] lg:text-[32px] leading-[42.8px] tracking-[-0.64px]">
                {card_title}
                <Underline />
              </p>
            )}
            {card_subtitle && <p className="mt-5 italic font-light text-[16px] leading-[34px] tracking-[-0.32px] text-(--color-white)/80">{card_subtitle}</p>}
            {items.length > 0 && (
              <ul className="mt-2 flex flex-col gap-2.5">
                {items.map((item, i) => (
                  <Reveal as="li" key={i} x={-12} y={0} delay={0.3 + i * 0.07} className="flex items-start gap-2.5 font-medium text-[18px] lg:text-[20px] leading-8 tracking-[-0.4px]">
                    <Tick />
                    <span>{item}</span>
                  </Reveal>
                ))}
              </ul>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
