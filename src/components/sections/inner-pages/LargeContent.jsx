// src/components/sections/Overview.jsx
// ACF layout: large_content_section. Optional fields:
//   bg_image (image array) / bg_color (color) -> section background via sectionBackground(); nothing is applied when both are empty.
//   heading (textarea) -> rendered through toHtml() so line breaks survive.
//   container_width (button group "default" | "full") -> "full" drops the 768px (max-w-3xl) cap on heading + content so they span the site container (web-width, 1272px). Empty/"default"/missing = original narrow layout.

"use client";

import { sectionBackground, toHtml } from "@/lib/content";

export default function LargeContent({ data }) {
  if (!data) return null;
  const { sub_heading, heading, content_section, container_width } = data;
  // string on pages; {value,label} under acf_format=standard (products/cases/industries/icp)
  const isFull = (container_width?.value ?? container_width) === "full";
  const narrow = isFull ? "" : " max-w-3xl m-auto";

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
        {sub_heading && (
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <span className="h-2 w-2 rounded-full bg-(--color-yellow)"></span>
            <span className="subheading-label uppercase">{sub_heading}</span>
          </div>
        )}
        {heading && (
          <h2
            className={`cs-h3${narrow} cs-highlight cs-rich text-(--color-heading) max-md:text-(--color-black) mb-6 md:mb-14`}
            dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
          />
        )}
        {content_section && (
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
