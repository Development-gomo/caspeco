// src/components/sections/Overview.jsx

"use client";

import CtaButton from "@/components/ui/CtaButton";
import { hasText } from "@/lib/content";

export default function Overview({ data }) {
  if (!data) return null;
  const {
    sub_heading,
    heading,
    content_heading,
    short_text,
    cta_text,
    cta_url,
    highlighted_sub_heading,
    highlighted_heading,
  } = data;
  const hasSub = hasText(sub_heading);
  const hasHeading = hasText(heading);
  const hasContentHeading = hasText(content_heading);
  const hasShortText = hasText(short_text);
  const hasCta = hasText(cta_text) && !!cta_url;
  const hasHighlight = hasText(highlighted_sub_heading) && hasText(highlighted_heading);
  // nothing to show: skip the section (and its padding) entirely
  const hasMain = hasSub || hasHeading || hasContentHeading || hasShortText || hasCta;
  if (!hasMain && !hasHighlight) return null;

  return (
    <>
      {hasMain && (
      <section
        id="next"
        className="about-section py-15 md:py-30 web-width px-6"
      >
        {/* SUB HEADING WITH DOT */}
        {hasSub && (
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="h-2 w-2 rounded-full bg-(--color-yellow)"></span>
          <span className="subheading-label uppercase">{sub_heading}</span>
        </div>
        )}
        {hasHeading && (
        <div
          className="section-heading mb-6 md:mb-14 max-w-[1100px]"
          dangerouslySetInnerHTML={{ __html: heading }}
        />
        )}

        {/* MAIN HEADING + 2 COLUMN LAYOUT */}
        <div className="flex md:gap-4 md:gap-12">
          {/* LEFT COLUMN — MAIN H2 + ONELINER */}
          <div className="lg:w-[45%]"></div>

          {/* RIGHT COLUMN — CONTENT HEADING + BODY + CTA */}
          <div className="lg:w-[55%]">
            {/* Content heading */}
            {hasContentHeading && (
              <h3 className="cs-h4  max-w-[490px] mb-6">
                {content_heading}
              </h3>
            )}

            {/* Paragraph */}
            {hasShortText && (
              <div
                className="max-w-[490px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}

            {/* CTA BUTTON */}
            {hasCta && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>
        </div>
      </section>
      )}
      {hasHighlight && (
      <section className="pb-12 md:pb-30 web-width px-6">
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="subheading-label uppercase text-[var(--color-yellow)]">
            {highlighted_sub_heading}
          </span>
        </div>
        <div
          className="highlighted-heading text-[var(--color-black)]"
          dangerouslySetInnerHTML={{ __html: highlighted_heading }}
        />
      </section>
      )}
    </>
  );
}
