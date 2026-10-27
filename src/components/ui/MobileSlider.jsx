// src/components/ui/MobileSlider.jsx
// Mobile-only (< 768px) swipe slider, Figma "Final Mobile Mockups" card sliders
// (Tailor your solution, Insights, Your people, Find your next step …).
//
// Native CSS scroll-snap, no library: put MOBILE_TRACK on the element that holds the cards
// (next to its existing grid classes) and MOBILE_SLIDE on each card. Every class is max-md:
// scoped, so tablet and desktop keep their current layout untouched.
// Under the track render <SliderPoints trackRef={ref} count={n} /> — the Figma "Slider points"
// (3 graded dots: active 13px #FFC120, next 10px, then 8px; 11px apart; hidden from md up).

"use client";

import React from "react";

// Track: horizontal scroll with snap, no scrollbar. Width/gap/inset per section via max-md: utilities.
export const MOBILE_TRACK =
  "max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:overscroll-x-contain max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden";
// Slide: fixed width set per section (e.g. max-md:w-[296px]); never shrinks, snaps to the start
export const MOBILE_SLIDE = "max-md:shrink-0 max-md:snap-start";

// Index of the slide nearest the snap position (start edge + scroll-padding, or the centre)
function activeIndex(track, align) {
  const slides = [...track.children].filter((c) => c.offsetWidth > 0);
  if (!slides.length) return 0;
  const box = track.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
  const target = align === "center" ? box.left + box.width / 2 : box.left + pad;
  let best = 0;
  let dist = Infinity;
  slides.forEach((s, i) => {
    const r = s.getBoundingClientRect();
    const d = Math.abs((align === "center" ? r.left + r.width / 2 : r.left) - target);
    if (d < dist) { dist = d; best = i; }
  });
  // at the far end the last slide may never reach the snap line
  if (Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth - 2) best = slides.length - 1;
  return best;
}

export function useSlideIndex(trackRef, align = "start") {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIndex(activeIndex(track, align)));
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [trackRef, align]);
  return index;
}

// Figma "Slider points": sizes by distance from the active slide (13 / 10 / 8px); dots three or
// more slides away are hidden, so a 4-card slider reads 13·10·8 exactly like the mockup.
const SIZE = [13, 10, 8];

export function SliderPoints({ trackRef, count, align = "start", inactive = "#DADCDD", className = "" }) {
  const index = useSlideIndex(trackRef, align);
  if (!count || count < 2) return null;

  const goTo = (i) => {
    const track = trackRef.current;
    const slide = track?.children[i];
    if (!slide) return;
    const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
    // slide position inside the scrolled content (rect-based, so no positioned parent is needed)
    const x = track.scrollLeft + slide.getBoundingClientRect().left - track.getBoundingClientRect().left;
    const left = align === "center" ? x - (track.clientWidth - slide.offsetWidth) / 2 : x - pad;
    track.scrollTo({ left, behavior: "smooth" });
  };

  return (
    <div className={`flex items-center justify-center gap-[11px] md:hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const d = Math.abs(i - index);
        if (d > 2) return null;
        const size = SIZE[d];
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={d === 0 ? "true" : undefined}
            onClick={() => goTo(i)}
            className="shrink-0 cursor-pointer rounded-full transition-[width,height,background-color] duration-300 ease-out"
            style={{ width: size, height: size, backgroundColor: d === 0 ? "#FFC120" : inactive }}
          />
        );
      })}
    </div>
  );
}
