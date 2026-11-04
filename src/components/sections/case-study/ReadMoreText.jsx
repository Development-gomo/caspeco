// src/components/sections/case-study/ReadMoreText.jsx
// Rich text clamped to 6 lines with a "Read more / Read less" toggle. The toggle only appears when
// the text really overflows (long copy would otherwise grow past the card next to it).
// Mobile (<768px): the toggle is the Figma "Text CTA / Link and arrow" (petrol Medium 16/20, 1px underline,
// arrow icon like ArrowLink); desktop/tablet keep the bold black label with the yellow underline.
// Labels: the layout's ACF fields (moreLabel / lessLabel), else lib/postStrings (showMore / showLess) per language.

"use client";

import React from "react";
import Image from "next/image";
import ArrowPetrol from "../../../../public/icons/home/arrow-petrol.svg";
import { DEFAULT_LANG } from "@/config";
import { postStrings } from "@/lib/postStrings";

export default function ReadMoreText({ html, className = "", lang = DEFAULT_LANG, moreLabel, lessLabel }) {
  const ref = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [overflows, setOverflows] = React.useState(false);
  const t = postStrings(lang);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!open) setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html, open]);

  return (
    <div className="flex flex-col items-start gap-3">
      <div ref={ref} className={`${className} ${open ? "" : "line-clamp-6"}`} dangerouslySetInnerHTML={{ __html: html }} />
      {(overflows || open) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group inline-flex cursor-pointer items-center gap-2 text-[16px] leading-5 tracking-[-0.32px] max-md:font-medium max-md:text-(--color-petrol) md:font-bold md:text-(--color-black) md:hover:text-(--color-gold)"
        >
          <span className="underline max-md:decoration-1 max-md:underline-offset-2 md:decoration-(--color-yellow) md:decoration-2 md:underline-offset-4">
            {open ? lessLabel || t.showLess : moreLabel || t.showMore}
          </span>
          <Image src={ArrowPetrol} alt="" width={17.5} height={11} className="transition-transform duration-300 group-hover:translate-x-1 md:hidden" />
        </button>
      )}
    </div>
  );
}
