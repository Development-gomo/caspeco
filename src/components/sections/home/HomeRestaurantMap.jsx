// src/components/sections/home/HomeRestaurantMap.jsx
// ACF layout: home_restaurant_map_section — 3D restaurant image with "+" hotspots.
// Hotspot positions (pos_x / pos_y) are percentages of the image, so they stay
// on the same spot at every screen size. Hover (desktop) or tap opens the tooltip.
// Mobile (< 768, Figma "Group 1699" 601:9044): no panning — the 450px-wide image sits centred in the
// 393 frame (28px clipped each side), 24px under the heading, with the small yellow-ring hotspots.

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const toPercent = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
};

function Hotspot({ spot, open, onToggle, onHover, lang }) {
  const x = toPercent(spot.pos_x);
  const y = toPercent(spot.pos_y);
  if (x === null || y === null) return null;

  const text = spot.text_ || spot.text;
  const alignRight = x > 70; // keep the tooltip inside the image near the right edge

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${open ? "z-30" : "z-10"}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={spot.title || undefined}
        className={`group relative block size-7 max-md:size-[16.7px] md:size-[38px] cursor-pointer rounded-full bg-[rgba(255,255,255,0.66)] max-md:border-[0.5px] max-md:border-[#FFD000] max-md:bg-[rgba(255,208,0,0.6)] max-md:before:absolute max-md:before:-inset-[10px] max-md:before:content-[''] transition hover:opacity-100 hover:scale-110 ${open ? "opacity-100" : "opacity-80 max-md:opacity-100"}`}
      >
        {/* plus → petrol "×" on hover and while the tooltip is open */}
        <span
          className={`absolute inset-0 m-auto h-[62.8%] w-[11.6%] rounded-full transition duration-300 group-hover:bg-(--color-petrol) max-md:hidden ${open ? "rotate-45 bg-(--color-petrol)" : "bg-(--color-grey-dark)"}`}
        />
        <span
          className={`absolute inset-0 m-auto h-[11.6%] w-[62.8%] rounded-full transition duration-300 group-hover:bg-(--color-petrol) max-md:hidden ${open ? "rotate-45 bg-(--color-petrol)" : "bg-(--color-grey-dark)"}`}
        />
        {/* mobile marker (Figma): 7.2px dot, gradient #FFC120 → #E1AB20, drop shadow, black 3.2px "+" (0.3 stroke) */}
        <span
          aria-hidden
          className="absolute inset-0 m-auto hidden size-[7.2px] items-center justify-center rounded-full max-md:flex"
          style={{ background: "linear-gradient(135deg, #FFC120 0%, #E1AB20 100%)", boxShadow: "-2.18px 2.18px 4.36px rgba(0,0,0,0.19)" }}
        >
          <svg width="3.2" height="3.2" viewBox="0 0 3.2 3.2" className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
            <path d="M1.6 0V3.2M0 1.6H3.2" stroke="#000" strokeWidth="0.3" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (spot.title || text) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            // mobile: Figma tooltip card 158×77 (padding 7.1/13.4/11.8, radius 6.3, no shadow)
            className={`absolute top-[calc(100%+12px)] w-[260px] rounded-[8px] bg-(--color-light-grey)/80 backdrop-blur-[8px] px-[17px] pt-[9px] pb-[15px] text-(--color-grey-dark) shadow-[0px_8px_24px_rgba(0,0,0,0.25)] max-md:top-[calc(100%+9px)] max-md:w-[158px] max-md:rounded-[6.3px] max-md:px-[13.4px] max-md:pt-[7.1px] max-md:pb-[11.8px] max-md:shadow-none ${alignRight ? "right-0" : "left-0"}`}
          >
            {spot.title && <p className="font-bold text-[20px] leading-[1.1] tracking-[-0.4px] max-md:text-[15.8px] max-md:tracking-[-0.32px]">{spot.title}</p>}
            {text && (
              <div
                className="cs-rich mt-1 text-[14px] leading-4 tracking-[-0.28px] max-md:mt-[3.2px] max-md:text-[11px] max-md:leading-[12.6px] max-md:tracking-[-0.22px]"
                dangerouslySetInnerHTML={{ __html: toHtml(text) }}
              />
            )}
            {spot.cta_text && spot.cta_url && (
              <Link href={langHref(spot.cta_url, lang)} className="mt-2 inline-block text-[14px] font-medium underline text-(--color-petrol)">
                {spot.cta_text}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeRestaurantMap({ data, lang = DEFAULT_LANG }) {
  const image = data?.image;
  const imageUrl = mediaUrl(image);
  const hotspots = rows(data?.hotspots);
  const [active, setActive] = React.useState(null);
  const sectionRef = React.useRef(null);

  // Close the open tooltip when tapping outside the section
  React.useEffect(() => {
    if (active === null) return;
    const close = (e) => {
      if (!sectionRef.current?.contains(e.target)) setActive(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [active]);

  if (!data?.heading && !imageUrl) return null;

  return (
    <section
      ref={sectionRef}
      // cs-sec: 64px top/bottom on mobile only
      className="cs-sec relative overflow-hidden pt-12 lg:pt-[72px] max-md:[--sec-pb:41px]"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, #0b2533 0%, #0b2533 100%)",
      })}
    >
      {data.heading && (
        <div className="cs-container">
          <h2
            className="cs-h2 cs-highlight mx-auto max-w-[839px] text-center text-(--color-light-grey) max-md:leading-9! max-md:tracking-[-1.44px]!"
            dangerouslySetInnerHTML={{ __html: toHtml(data.heading) }}
          />
        </div>
      )}

      {imageUrl && (
        <div className="relative mx-auto w-full max-w-[1512px] aspect-[1512/767] max-md:ml-[calc(50%-225px)] max-md:mt-6 max-md:w-[450px] max-md:max-w-none">
          <Image
            src={imageUrl}
            alt={image?.alt || ""}
            fill
            sizes="(max-width: 767px) 450px, 100vw"
            className="object-cover"
          />
          {hotspots.map((spot, i) => (
            <Hotspot
              key={i}
              spot={spot}
              lang={lang}
              open={active === i}
              onToggle={() => setActive((cur) => (cur === i ? null : i))}
              onHover={(entering) => {
                if (window.matchMedia("(hover: hover)").matches) setActive(entering ? i : null);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
