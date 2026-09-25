// src/components/sections/Overview.jsx

"use client";

import CtaButton from "@/components/ui/CtaButton";

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

  return (
    <>
      <section
        id="next"
        className="about-section py-15 md:py-30 web-width px-6"
      >
        {/* SUB HEADING WITH DOT */}
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
          <span className="subheading-label uppercase">{sub_heading}</span>
        </div>
        <div
          className="section-heading mb-6 md:mb-14 max-w-[1100px]"
          dangerouslySetInnerHTML={{ __html: heading }}
        />

        {/* MAIN HEADING + 2 COLUMN LAYOUT */}
        <div className="flex md:gap-4 md:gap-12">
          {/* LEFT COLUMN — MAIN H2 + ONELINER */}
          <div className="lg:w-[45%]"></div>

          {/* RIGHT COLUMN — CONTENT HEADING + BODY + CTA */}
          <div className="lg:w-[55%]">
            {/* Content heading */}
            {content_heading && (
              <h3 className="content-heading  max-w-[490px] mb-6">
                {content_heading}
              </h3>
            )}

            {/* Paragraph */}
            {short_text && (
              <div
                className="max-w-[490px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}

            {/* CTA BUTTON */}
            {cta_text && cta_url && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>
        </div>
      </section>
      {highlighted_sub_heading && highlighted_heading && (
      <section className="pb-12 md:pb-30 web-width px-6">
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="subheading-label uppercase text-[var(--color-accent)]">
            {highlighted_sub_heading}
          </span>
        </div>
        <div
          className="highlighted-heading text-[var(--color-brand)]"
          dangerouslySetInnerHTML={{ __html: highlighted_heading }}
        />
      </section>
      )}
    </>
  );
}
