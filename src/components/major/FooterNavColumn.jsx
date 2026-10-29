// src/components/major/FooterNavColumn.jsx
// One footer nav column (Services / Company / Insights).
// md+ (tablet and desktop): unchanged — heading with the links always open.
// Mobile (< 768px): Figma "Home_Page_Mobile_Mockup" FOOTER (2517:5308) — accordion. Heading row
// Bold 24 on a 26px line with the #8F8D88 chevron (down when closed, up when open); 16px above and
// 15px + 1px #FDFDFD@15% rule below each row; open: links Light 18/110% #FDFDFD, 8px apart.
"use client";

import { useId, useState } from "react";
import Link from "next/link";

const HEADING = "text-[24px] font-bold leading-[1.1] tracking-[-0.48px] text-white";

export default function FooterNavColumn({ title, links }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const expanded = open || !title;

  return (
    // Figma: 26px row, 16 gap, 1px rule (0-height line), 16 gap → 58px pitch, 158 for three
    <div className="min-w-[150px] lg:w-[174px] max-md:w-full max-md:border-b max-md:border-(--color-white)/15 max-md:pt-4 max-md:pb-[15px] max-md:first:pt-0">
      {title && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={listId}
            className={`flex w-full cursor-pointer items-center justify-between gap-4 text-left leading-[26px]! md:hidden ${HEADING}`}
          >
            {title}
            {/* Figma "Chevron" (Open = down, Close = rotated 180°) */}
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              aria-hidden="true"
              className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            >
              <path
                d="M6.294 7.707a1 1 0 0 0 1.415 0l5.998-5.999A1 1 0 0 0 12.292.293L7 5.586 1.708.296A1 1 0 0 0 .293 1.711l5.998 5.999z"
                fill="#8F8D88"
              />
            </svg>
          </button>
          <p className={`mb-5 max-md:hidden ${HEADING}`}>{title}</p>
        </>
      )}

      {/* collapsed on mobile (invisible keeps the hidden links out of the tab order); always open from md */}
      <div
        id={listId}
        className={`grid md:visible md:grid-rows-[1fr] md:opacity-100 max-md:transition-all max-md:duration-300 max-md:ease-out ${
          expanded ? `visible grid-rows-[1fr] opacity-100 ${title ? "max-md:mt-2" : ""}` : "max-md:invisible grid-rows-[0fr] max-md:opacity-0"
        }`}
      >
        <div className="overflow-hidden md:overflow-visible">
          <ul className="space-y-3 max-md:space-y-2 text-[18px] font-light leading-[1.1] tracking-[-0.36px] text-(--color-grey-medium) max-md:text-(--color-white)">
            {links.map((item, i) => (
              <li key={i}>
                <Link href={item.href} className="cs-link-draw hover:text-white">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
