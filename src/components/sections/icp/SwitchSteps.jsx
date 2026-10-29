// src/components/sections/icp/SwitchSteps.jsx
// ACF layout: switch_steps_section — Figma "We handle the switch". Italic eyebrow, a
// two-line heading whose second line is yellow, a description + CTA on the right, then
// up to 3 dark step cards (label "Step 1 · [X weeks]", big "01", title).
// Mobile (< 768, Figma ICP mobile steps): padding 64, eyebrow Regular Italic 18/22 #3F3E3C,
// eyebrow → H 16, H → text 16, text → CTA 24, intro → cards 40; cards 270 tall, 20 apart,
// timing Regular 20/20, number Bold 80/64, title Bold 26/28.

import CtaButton from "@/components/ui/CtaButton";
import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { rows, sectionBackground, toHtml } from "@/lib/content";

// Figma "We handle the switch" fill: #FFFFFF@50% 0% → #DADCDD 80.6% (top → bottom)
export const SWITCH_GRADIENT = "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, #DADCDD 80.6%), #FFFFFF";

// joined: People cards follow inside the same Figma section — the wrapper paints the gradient
// and this section drops its bottom padding (People adds the 100px gap).
export default function SwitchSteps({ data, lang = DEFAULT_LANG, joined = false }) {
  const steps = rows(data?.steps).filter((s) => s.number || s.title);
  const { eyebrow, heading, heading_highlight, cta_text, cta_url } = data || {};
  const text = data?.text || data?.short_text; // short_text in "Page Builder ICP Page"
  if (!heading && steps.length === 0) return null;

  return (
    <section className={`cs-sec pt-18 lg:pt-36 ${joined ? "pb-0 max-md:[--sec-pb:0px]" : "pb-18 lg:pb-36"}`} style={joined ? undefined : sectionBackground(data, { background: SWITCH_GRADIENT })}>
      <div className="cs-container flex flex-col gap-12 max-md:gap-10 lg:gap-[54px]">
        <div className="flex flex-col gap-8 max-md:gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal className="flex max-w-[724px] flex-col gap-3.5 max-md:gap-4">
            {eyebrow && <p className="italic font-normal text-[18px] lg:text-[20px] leading-[26px] tracking-[-0.8px] text-(--color-dark-petrol) max-md:leading-[22px] max-md:tracking-[-0.36px] max-md:text-(--color-grey-dark)">{eyebrow}</p>}
            {(heading || heading_highlight) && (
              <h2 className="cs-h2 cs-rich text-(--color-heading)">
                {heading && <span className="block" style={{ color: "var(--color-heading)" }} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
                {heading_highlight && <span className="block text-(--color-yellow)" dangerouslySetInnerHTML={{ __html: toHtml(heading_highlight) }} />}
              </h2>
            )}
          </Reveal>

          {(text || (cta_text && cta_url)) && (
            // Figma: right column starts level with the title (10px above the highlight's baseline box)
            <Reveal delay={0.15} className="flex max-w-[484px] flex-col items-start gap-5 max-md:gap-6 lg:mb-2.5">
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
                className="flex min-h-[230px] flex-col justify-between gap-10 rounded-[8px] bg-(--color-dark-petrol) p-6 text-(--color-white) shadow-[0px_14px_32px_rgba(16,39,51,0.13)] transition-[translate] duration-300 hover:-translate-y-1 max-md:min-h-[270px] lg:min-h-[266px]"
              >
                {step.label && <p className="text-[18px] max-md:text-[20px] lg:text-[20px] leading-5 tracking-[-0.4px]">{step.label}</p>}
                <div className="flex flex-col gap-5">
                  {step.number && (
                    <p className="font-bold text-[56px] leading-[64px] tracking-[-1.12px] max-md:text-[80px] max-md:tracking-[-1.6px] lg:text-[80px] lg:tracking-[-1.6px]">
                      <CountUp value={step.number} duration={0.9} />
                    </p>
                  )}
                  {step.title && <p className="font-bold text-[22px] max-md:text-[26px] lg:text-[26px] leading-[28px] tracking-[-0.52px]" dangerouslySetInnerHTML={{ __html: toHtml(step.title) }} />}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
