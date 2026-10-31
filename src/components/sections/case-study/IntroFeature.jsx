// src/components/sections/case-study/IntroFeature.jsx
// ACF layout: case_feature_cards ("Intro Feature Section") in the "Page Builder Case study" group.
// Left: heading (H2 style), text (body font) and CTA. Right: a dark "at a glance" card where each
// ACF card is one row: title = grey label, text = white value, divider lines between rows.
// "Make it button style" = enable → the value is shown as yellow pills (comma or line separated),
// like the "Modules" row.

import Reveal from "@/components/ui/Reveal";
import CtaButton from "@/components/ui/CtaButton";
import ReadMoreText from "./ReadMoreText";
import VideoCta from "./VideoCta";
import { DEFAULT_LANG, langHref } from "@/config";
import { rows, sectionBackground, toHtml } from "@/lib/content";

const pills = (text) =>
  String(text || "")
    .split(/\r?\n|,/)
    .map((t) => t.replace(/<[^>]*>/g, "").trim())
    .filter(Boolean);

export default function IntroFeature({ data, lang = DEFAULT_LANG }) {
  const cards = rows(data?.cards).filter((c) => c.title);
  const { heading, short_text, cta_text, cta_url, video_url } = data || {};
  const video = typeof video_url === "string" ? video_url.trim() : "";
  if (!heading && !short_text && cards.length === 0) return null;

  return (
    <section className="cs-sec py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-white)" })}>
      <div className="cs-container flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <Reveal className="flex flex-col items-start gap-6 lg:w-1/2">
          {heading && <h2 className="cs-h2 cs-highlight cs-rich text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <ReadMoreText lang={lang} moreLabel={data.read_more_text} lessLabel={data.read_less_text} className="cs-p2 cs-rich max-w-[560px] text-(--color-grey-dark)" html={toHtml(short_text)} />}
          {/* Video CTA text + Video URL → button opening the video popup; a plain CTA URL still works as a link */}
          {cta_text && video ? (
            <VideoCta url={video}>{cta_text}</VideoCta>
          ) : (
            cta_text && cta_url && <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>
          )}
        </Reveal>

        {cards.length > 0 && (
          <Reveal delay={0.15} className="rounded-[8px] bg-(--color-dark-petrol) p-6 text-(--color-white) shadow-[0px_4px_6px_rgba(0,0,0,0.16)] lg:w-1/2 lg:p-8">
            <dl>
              {cards.map((card, i) => {
                const asPills = card.make_it_button_style === "enable";
                return (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-2 border-t border-white/15 py-5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[35%_1fr] sm:items-center sm:gap-6"
                  >
                    <dt className="text-[16px] leading-5 tracking-[-0.32px] text-(--color-grey-medium)">{card.title}</dt>
                    <dd className="m-0">
                      {asPills ? (
                        <ul className="flex flex-wrap gap-2">
                          {pills(card.text).map((p, j) => (
                            <li key={j} className="rounded-full bg-(--color-yellow) px-4 py-1.5 text-[16px] font-bold leading-5 tracking-[-0.32px] text-(--color-black)">
                              {p}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        card.text && <div className="cs-rich text-[18px] font-medium leading-6 tracking-[-0.36px] lg:text-[20px]" dangerouslySetInnerHTML={{ __html: toHtml(card.text) }} />
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
