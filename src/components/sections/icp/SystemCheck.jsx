// src/components/sections/icp/SystemCheck.jsx
// ACF layout: system_check_section — Figma "Everything your restaurant needs" on the ICP
// pages. Darkened photo background; left: yellow italic eyebrow, white heading, text and
// CTA; right: frosted glass card with an italic title over a hand-drawn yellow underline,
// an italic intro line and a ticked checklist.

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, toHtml } from "@/lib/content";

// Figma "Success" — white rounded box with a dark tick
function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="mt-[3px] shrink-0">
      <rect width="18" height="18" rx="3" fill="#FDFDFD" />
      <path d="M4.5 9.2l3 3 6-6.4" fill="none" stroke="#151411" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Figma "Line 405" — slightly wavy hand-drawn underline, stretches to the title width
function Underline() {
  return (
    <svg viewBox="0 0 364 12" preserveAspectRatio="none" aria-hidden className="absolute -bottom-2.5 left-2 h-3 w-[calc(100%-0.5rem)]">
      <path d="M1.5 8.5C60 4 140 2.5 220 4.5c50 1.2 95 3.5 142 6" fill="none" stroke="var(--color-yellow)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function SystemCheck({ data, lang = DEFAULT_LANG }) {
  const items = rows(data?.checklist).map((r) => r.item || r.text).filter(Boolean);
  const { eyebrow, heading, text, cta_text, cta_url, card_title, card_subtitle } = data || {};
  if (!heading && items.length === 0) return null;
  const bg = mediaUrl(data?.bg_image);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-18 lg:py-[80px]" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/85 via-black/60 to-black/40" aria-hidden />

      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <Reveal className="flex flex-col items-start gap-10 lg:max-w-[507px]">
          <div className="flex flex-col gap-5 text-(--color-light-grey)">
            <div className="flex flex-col">
              {eyebrow && <p className="italic font-light text-[18px] lg:text-[20px] leading-[26px] tracking-[-0.4px] text-(--color-yellow)">{eyebrow}</p>}
              {heading && <h2 className="cs-h3 cs-highlight cs-rich font-extrabold" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            </div>
            {text && (
              <div className="cs-rich font-bold text-[16px] lg:text-[18px] leading-6 tracking-[-0.36px]" dangerouslySetInnerHTML={{ __html: toHtml(text) }} />
            )}
          </div>
          {cta_text && cta_url && (
            <CtaButton href={langHref(cta_url.trim(), lang)} wrap className="max-w-full">
              {cta_text}
            </CtaButton>
          )}
        </Reveal>

        {(card_title || items.length > 0) && (
          // Frosted glass card — no ancestor may use opacity/filter/clip-path or the blur sees nothing
          <Reveal
            x={40}
            y={0}
            delay={0.15}
            className="w-full rounded-[8px] border border-white/20 p-6 text-(--color-light-grey) shadow-[0px_4px_24px_rgba(0,0,0,0.25)] backdrop-blur-[20px] sm:p-8 lg:max-w-[701px]"
            style={{ backgroundImage: "linear-gradient(135deg, rgba(253,253,253,0.2) 0%, rgba(253,253,253,0.08) 55%, rgba(253,253,253,0.04) 100%)" }}
          >
            {card_title && (
              <p className="relative mb-8 inline-block italic font-light text-[28px] lg:text-[36px] leading-[1.2] tracking-[-0.72px]">
                {card_title}
                <Underline />
              </p>
            )}
            {card_subtitle && <p className="mb-3 italic font-light text-[14px] leading-[34px] text-(--color-light-grey)/80">{card_subtitle}</p>}
            {items.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                  <Reveal as="li" key={i} x={-12} y={0} delay={0.3 + i * 0.07} className="flex items-start gap-2.5 text-[16px] lg:text-[18px] font-medium leading-[24px] tracking-[-0.36px]">
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
