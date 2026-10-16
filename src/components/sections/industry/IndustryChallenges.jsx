// src/components/sections/industry/IndustryChallenges.jsx
// ACF layout: industry_challenges_section — Figma "Built around the realities of running a
// restaurant". Heading, then a dark feature card (big stat, text, yellow-ruled platform
// promise, CTA) next to a 2×2 grid of challenge cards (icon, value, text).
// Motion: heading/cards reveal on scroll (staggered), the big stat counts up,
// cards lift on hover and their icon circle turns yellow.

import Image from "next/image";
import CountUp from "@/components/ui/CountUp";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

function ChallengeCard({ item, index }) {
  const icon = mediaUrl(item.icon);
  return (
    <Reveal
      delay={0.15 + index * 0.08}
      className="group flex min-h-[228px] flex-col gap-8 rounded-[8px] bg-white p-6 shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.12)] lg:p-8"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-(--color-dark-petrol) transition-colors duration-300 group-hover:bg-(--color-yellow)">
        {icon && <Image src={icon} alt="" width={18} height={18} className="size-[18px] object-contain brightness-0 invert transition duration-300 group-hover:invert-0" />}
      </span>
      <div className="mt-auto flex flex-col gap-2">
        {item.value && <p className="font-bold text-[24px] leading-7 tracking-[-0.48px] text-black"><CountUp value={item.value} /></p>}
        {item.text && (
          <div className="cs-rich text-[16px] lg:text-[18px] leading-[22px] tracking-[-0.36px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(item.text) }} />
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

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {heading && (
          <Reveal as="h2" className="cs-h2 cs-highlight cs-rich text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[461fr_787fr]">
          {hasFeature && (
            <Reveal className="flex flex-col items-start gap-10 rounded-[8px] bg-(--color-dark-petrol) p-8 text-(--color-light-grey) shadow-[0px_4px_6px_0px_rgba(0,0,0,0.16)] lg:px-10 lg:pt-[52px] lg:pb-10">
              <div className="flex flex-col gap-5">
                {feature_value && (
                  <p className="font-extrabold text-[72px] leading-[0.95] tracking-[-2.88px] text-(--color-yellow) lg:text-[104px] lg:tracking-[-4.16px]">
                    <CountUp value={feature_value} />
                  </p>
                )}
                {feature_text && (
                  <div className="cs-rich text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px]" dangerouslySetInnerHTML={{ __html: toHtml(feature_text) }} />
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
                <CtaButton href={langHref(cta_url.trim(), lang)} wrap className="mt-auto max-w-full">
                  {cta_text}
                </CtaButton>
              )}
            </Reveal>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
