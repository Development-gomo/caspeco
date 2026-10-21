// src/components/sections/icp/SwitchSteps.jsx
// ACF layout: switch_steps_section — Figma "We handle the switch". Italic eyebrow, a
// two-line heading whose second line is yellow, a description + CTA on the right, then
// up to 3 dark step cards (label "Step 1 · [X weeks]", big "01", title).

import CtaButton from "@/components/ui/CtaButton";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { rows, sectionBackground, toHtml } from "@/lib/content";

const GRADIENT = "linear-gradient(180deg, #fdfdfd 0%, #dadcdd 100%)";

export default function SwitchSteps({ data, lang = DEFAULT_LANG }) {
  const steps = rows(data?.steps).filter((s) => s.number || s.title);
  const { eyebrow, heading, heading_highlight, text, cta_text, cta_url } = data || {};
  if (!heading && steps.length === 0) return null;

  return (
    <section className="py-18 lg:pt-36 lg:pb-[72px]" style={sectionBackground(data, { backgroundImage: GRADIENT })}>
      <div className="cs-container flex flex-col gap-12 lg:gap-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal className="flex max-w-[724px] flex-col gap-3.5">
            {eyebrow && <p className="italic text-[18px] lg:text-[20px] leading-[26px] tracking-[-0.4px] text-(--color-dark-petrol)">{eyebrow}</p>}
            {(heading || heading_highlight) && (
              <h2 className="cs-h2 cs-highlight cs-rich text-black">
                {heading && <span className="block text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
                {heading_highlight && <span className="block text-(--color-yellow)" dangerouslySetInnerHTML={{ __html: toHtml(heading_highlight) }} />}
              </h2>
            )}
          </Reveal>

          {(text || (cta_text && cta_url)) && (
            <Reveal delay={0.15} className="flex max-w-[484px] flex-col items-start gap-5">
              {text && <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(text) }} />}
              {cta_text && cta_url && (
                <CtaButton href={langHref(cta_url.trim(), lang)} wrap className="max-w-full">
                  {cta_text}
                </CtaButton>
              )}
            </Reveal>
          )}
        </div>

        {steps.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal
                key={i}
                delay={0.1 + i * 0.1}
                className="flex min-h-[230px] flex-col justify-between gap-10 rounded-[8px] bg-(--color-dark-petrol) p-6 text-(--color-light-grey) shadow-[0px_4px_6px_rgba(0,0,0,0.16)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0px_10px_24px_rgba(0,0,0,0.25)] lg:min-h-[270px]"
              >
                {step.label && <p className="text-[16px] lg:text-[18px] leading-5 tracking-[-0.36px]">{step.label}</p>}
                <div className="flex flex-col gap-5">
                  {step.number && (
                    <p className="font-extrabold text-[56px] leading-[64px] tracking-[-1.68px] lg:text-[64px]">
                      <CountUp value={step.number} duration={0.9} />
                    </p>
                  )}
                  {step.title && <p className="font-bold text-[20px] lg:text-[24px] leading-[28px] tracking-[-0.48px]">{step.title}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
