// src/components/sections/industry/IndustryChallenges.jsx
// ACF layout: industry_challenges_section — Figma "Built around the realities of running a
// restaurant". Heading, then a dark feature card (big yellow stat, bold text, CTA) next to a
// 2×2 grid of challenge cards: photo (bg_image) behind a dark overlay, yellow icon circle,
// white title and text at the bottom. enable_gradient switches the section to the light
// grey → white gradient. (promise_title / promise_text from older content still render.)
// Motion: heading/cards reveal on scroll (staggered), the big stat counts up, cards lift on
// hover and their photo zooms slightly.
// Mobile (< 768, Figma Industry mobile): padding 64 top (0 before the tabs), H2 without the forced
// <br>, feature card padding 48/24/24/24 gap 24 (stat Bold 80/80 -8px, text Bold 26/28, 12 apart),
// cards stacked 16 apart: padding 24, icon → body 48, title Bold 26/28, text Regular 18/22.

import Image from "next/image";
import CountUp from "@/components/ui/CountUp";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// Figma gradient over white
const GRADIENT = "linear-gradient(180deg, rgba(218, 220, 221, 0.80) -0.94%, rgba(255, 255, 255, 0.50) 100.94%), #FFF";

// <br> → desktop-only break plus a mobile-only space (no change at ≥ 768)
const desktopBreaks = (html) => html.replace(/<br\s*\/?>/gi, '<span class="max-md:hidden"><br /></span><span class="md:hidden"> </span>');

function ChallengeCard({ item, index }) {
  const icon = mediaUrl(item.icon);
  const photo = mediaUrl(item.bg_image);
  return (
    <Reveal
      delay={0.15 + index * 0.08}
      className="group relative isolate flex min-h-[228px] flex-col justify-between gap-8 overflow-hidden max-md:min-h-0 max-md:justify-start max-md:gap-12 rounded-[8px] bg-(--color-dark-petrol) p-6 text-(--color-light-grey) shadow-[0px_4px_6px_rgba(0,0,0,0.16)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_24px_rgba(0,0,0,0.25)] lg:p-8"
    >
      {photo && (
        <Image
          src={photo}
          alt=""
          fill
          sizes="(min-width: 1024px) 382px, (min-width: 640px) 50vw, 100vw"
          className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}
      {photo && <span className="absolute inset-0 -z-10 bg-linear-to-b from-black/45 to-black/75" aria-hidden />}

      <span className="flex size-9 items-center justify-center rounded-full bg-(--color-yellow)">
        {icon && <Image src={icon} alt="" width={18} height={18} className="size-[18px] object-contain brightness-0" />}
      </span>
      <div className="flex flex-col gap-2">
        {item.value && <p className="cs-card-title font-bold text-[22px] lg:text-[26px] leading-7 tracking-[-0.52px]">{item.value}</p>}
        {item.text && (
          <div className="cs-rich cs-text font-light max-md:font-normal! text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px]" dangerouslySetInnerHTML={{ __html: toHtml(item.text) }} />
        )}
      </div>
    </Reveal>
  );
}

export default function IndustryChallenges({ data, lang = DEFAULT_LANG }) {
  const items = rows(data?.items).filter((i) => i.value || i.text);
  const { heading, feature_value, feature_text, promise_title, promise_text, cta_text, cta_url } = data || {};
  if (!heading && !feature_value && items.length === 0) return null;
  const hasFeature = feature_value || feature_text || promise_title;
  const fallback = { background: data?.enable_gradient ? GRADIENT : "var(--color-light-grey)" };

  return (
    <section className={`cs-sec pt-18 lg:pt-36 ${data?._next === "home_tab_section" ? "pb-12 max-md:[--sec-pb:0px] lg:pb-[72px]" : "pb-18 lg:pb-36"}`} style={sectionBackground(data, fallback)}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {heading && (
          // Mobile: the editor's forced line breaks are for desktop; below 768 they become a space so the
          // heading wraps naturally (Figma mobile: 3 lines)
          <Reveal as="h2" className="cs-h2 cs-highlight cs-rich max-w-[900px] text-black" dangerouslySetInnerHTML={{ __html: desktopBreaks(toHtml(heading)) }} />
        )}

        <div className="grid grid-cols-1 gap-6 max-md:gap-4 lg:grid-cols-[461fr_787fr]">
          {hasFeature && (
            <Reveal className="flex min-h-[400px] flex-col items-start justify-end gap-10 rounded-[8px] bg-(--color-dark-petrol) p-8 max-md:min-h-0 max-md:gap-6 max-md:px-6 max-md:pt-12 max-md:pb-6 text-(--color-light-grey) shadow-[0px_4px_6px_rgba(0,0,0,0.16)] lg:min-h-[480px] lg:p-10">
              <div className="flex flex-col gap-5 max-md:gap-3">
                {feature_value && (
                  <p className="font-bold text-[72px] leading-none tracking-[-5.76px] text-(--color-yellow) max-md:text-[80px] max-md:tracking-[-8px] lg:text-[100px] lg:tracking-[-8px]">
                    <CountUp value={feature_value} />
                  </p>
                )}
                {feature_text && (
                  <div className="cs-rich font-bold text-[22px] lg:text-[32px] leading-[1.1] lg:leading-8 tracking-[-0.64px] max-md:text-[26px] max-md:leading-7 max-md:tracking-[-0.52px]" dangerouslySetInnerHTML={{ __html: toHtml(feature_text) }} />
                )}
              </div>

              {(promise_title || promise_text) && (
                <div className="flex items-stretch gap-3">
                  <span className="w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow)" aria-hidden />
                  <span className="flex flex-col gap-1">
                    {promise_title && <span className="font-extrabold text-[18px] leading-5 tracking-[-0.36px]">{promise_title}</span>}
                    {promise_text && <span className="text-[14px] leading-4 tracking-[-0.28px] text-(--color-grey-medium)">{promise_text}</span>}
                  </span>
                </div>
              )}

              {cta_text && cta_url && (
                <CtaButton href={langHref(cta_url.trim(), lang)} wrap className="max-w-full">
                  {cta_text}
                </CtaButton>
              )}
            </Reveal>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-6 max-md:gap-4 sm:grid-cols-2 max-md:grid-cols-1!">
              {items.map((item, i) => (
                <ChallengeCard key={i} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
