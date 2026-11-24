// Fade-up reveal used by server-rendered sections. Plays once when scrolled into
// view (or on mount with `onMount`, for heroes); `delay` staggers siblings.
// Plain CSS transition (.cs-reveal in globals.css) driven by one IntersectionObserver per element: no
// animation library on the first load. Respects prefers-reduced-motion (opacity only) and shows the content
// without JavaScript.

"use client";

import { useEffect, useRef } from "react";

export default function Reveal({ as: Tag = "div", children, className = "", delay = 0, y = 24, x = 0, scale = 1, duration = 0.7, onMount = false, style, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.hasAttribute("data-in")) return;
    const show = () => el.setAttribute("data-in", "");
    if (onMount || typeof IntersectionObserver === "undefined") {
      const id = requestAnimationFrame(show);
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        // 20% of the element, or half the viewport for elements taller than 2.5 screens (their 20% is never reached)
        if (entries.some((e) => e.isIntersecting && (e.intersectionRatio >= 0.2 || e.intersectionRect.height >= (e.rootBounds?.height || window.innerHeight) * 0.5))) {
          io.disconnect();
          show();
        }
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onMount]);

  return (
    <Tag
      ref={ref}
      className={`cs-reveal ${className}`}
      style={{ "--rv-x": `${x}px`, "--rv-y": `${y}px`, "--rv-s": scale, "--rv-d": `${duration}s`, "--rv-delay": `${delay}s`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
