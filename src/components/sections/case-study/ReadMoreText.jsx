// src/components/sections/case-study/ReadMoreText.jsx
// Rich text clamped to 6 lines with a "Read more / Read less" toggle. The toggle only appears when
// the text really overflows (long copy would otherwise grow past the card next to it).
// Labels: the layout's ACF fields (moreLabel / lessLabel), else lib/postStrings (showMore / showLess) per language.

"use client";

import React from "react";
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
          className="cursor-pointer text-[16px] font-bold leading-5 tracking-[-0.32px] text-(--color-black) underline decoration-(--color-yellow) decoration-2 underline-offset-4 hover:text-(--color-gold)"
        >
          {open ? lessLabel || t.showLess : moreLabel || t.showMore}
        </button>
      )}
    </div>
  );
}
