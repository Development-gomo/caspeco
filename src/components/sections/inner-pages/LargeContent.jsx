// src/components/sections/Overview.jsx
// ACF layout: large_content_section. Optional fields:
//   bg_image (image array) / bg_color (color) -> section background via sectionBackground(); nothing is applied when both are empty.
//   heading (textarea) -> rendered through toHtml() so line breaks survive.
//   container_width (button group "default" | "full") -> "full" drops the 768px (max-w-3xl) cap on heading + content so they span the site container (web-width, 1272px). Empty/"default"/missing = original narrow layout.
//   section_alignment (button group "left" | "right" | "center") -> text alignment (the default 768px block always stays centred); empty = original layout. See the combination table below.

"use client";

import { hasText, sectionBackground, toHtml } from "@/lib/content";

export default function LargeContent({ data }) {
  if (!data) return null;
  const { sub_heading, heading, content_section, container_width, section_alignment } = data;
  // string on pages; {value,label} under acf_format=standard (products/cases/industries/icp)
  const isFull = (container_width?.value ?? container_width) === "full";
  const align = section_alignment?.value ?? section_alignment; // "left" | "right" | "center" | empty
  // container_width x section_alignment:
  //   default (768px cap): block always centred (margin 0 auto); alignment only sets the text alignment inside it
  //   full (site container): block spans the container, alignment sets the text alignment
  // empty alignment = original layout (centred 768px block, left-aligned text)
  const textAlign = { left: " text-left", right: " text-right", center: " text-center" }[align] || "";
  const place = isFull ? "" : " mx-auto"; // default width: always centred, whatever the alignment
  const narrow = (isFull ? "" : " max-w-3xl") + place + textAlign;
  const hasSub = hasText(sub_heading);
  const hasHeading = hasText(heading);
  const hasContent = hasText(content_section);
  // no text at all: skip the section (and its padding)
  if (!hasSub && !hasHeading && !hasContent) return null;

  return (
    <>
      <section
        id="next"
        className="about-section py-15 md:py-30"
        style={sectionBackground(data)}
      >
        {/* inner wrapper keeps the original content width; the section itself stays full-bleed for the background */}
        <div className="web-width px-6">
        {/* SUB HEADING WITH DOT */}
        {hasSub && (
          <div className={`body-text${narrow}`}>
            <span className="subheading-label">{sub_heading}</span>
          </div>
        )}
        {hasHeading && (
          <h2
            className={`cs-h3${narrow} cs-highlight cs-rich font-extrabold! text-(--color-heading) max-md:text-black mb-6 md:mb-10`} /* 800: .cs-h3 is unlayered 700, so it needs the important flag */
            dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
          />
        )}
        {hasContent && (
          <div
            className={`privacy-text${narrow}`}
            dangerouslySetInnerHTML={{ __html: content_section }}
          />
        )}
        </div>
      </section>
    </>
  );
}
