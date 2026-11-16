"use client";

// Yellow hand-drawn rule under a big heading (Quick contact). From 1024px up it is as wide as the
// heading's LAST rendered line (left-aligned with it) + the SVG's 2px padding on each side, instead
// of the full column. The width is measured on the client (DOM Range over the preceding <h2> →
// one rect per line fragment, grouped by line) and handed to CSS as --rule-w; until it is measured
// (server render, first client render, empty heading) the className's full-width fallback applies,
// so there is no hydration mismatch. Re-measures on heading resize and once web fonts are loaded.

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

// Width of the last rendered line of `el` (CSS px, transforms undone), or null when it has no text.
function lastLineWidth(el) {
  const box = el.getBoundingClientRect();
  if (!box.width) return null;
  const scale = el.offsetWidth / box.width; // undo ancestor transforms (e.g. a scale animation)
  const range = document.createRange();
  range.selectNodeContents(el);
  const lines = [];
  for (const r of range.getClientRects()) {
    if (!r.width || !r.height) continue; // <br> and collapsed whitespace
    const line = lines.find((l) => Math.abs(l.top - r.top) <= 2);
    if (line) {
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
      line.bottom = Math.max(line.bottom, r.bottom);
    } else {
      lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
  }
  if (!lines.length) return null;
  const last = lines.reduce((a, l) => (l.bottom > a.bottom ? l : a));
  return (last.right - last.left) * scale;
}

// pad: extra px added to the measured line (the SVG's padding on both sides)
export default function HeadingRule({ src, className = "", pad = 4 }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(null);

  useLayoutEffect(() => {
    const img = ref.current;
    let heading = img?.previousElementSibling;
    while (heading && heading.tagName !== "H2") heading = heading.previousElementSibling;
    if (!heading) return;

    let active = true;
    const measure = () => {
      if (!active) return;
      const w = lastLineWidth(heading);
      setWidth(w ? Math.round((w + pad) * 100) / 100 : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(heading);
    document.fonts?.ready.then(measure);
    return () => {
      active = false;
      ro.disconnect();
    };
  }, [pad]);

  return (
    <Image
      ref={ref}
      src={src}
      alt=""
      aria-hidden
      className={className}
      style={width ? { "--rule-w": `${width}px` } : undefined}
    />
  );
}
