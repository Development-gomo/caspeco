// src/components/sections/home/HomeRestaurantMap.jsx
// ACF layout: home_restaurant_map_section — 3D restaurant image with "+" hotspots.
// Hotspot positions (pos_x / pos_y) are percentages of the image, so they stay
// on the same spot at every screen size. Hover (desktop) or tap opens the tooltip.

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
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={spot.title || undefined}
        className="relative block size-7 md:size-[38px] cursor-pointer rounded-full bg-[rgba(255,255,255,0.66)] opacity-80 transition hover:opacity-100 hover:scale-110"
      >
        <span
          className={`absolute inset-0 m-auto h-[62.8%] w-[11.6%] rounded-full bg-(--color-grey-dark) transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        />
        <span
          className={`absolute inset-0 m-auto h-[11.6%] w-[62.8%] rounded-full bg-(--color-grey-dark) transition-transform duration-300 ${open ? "rotate-45" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (spot.title || text) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-[calc(100%+12px)] w-[200px] rounded-[8px] bg-(--color-light-grey) px-[17px] pt-[9px] pb-[15px] text-(--color-grey-dark) shadow-[0px_8px_24px_rgba(0,0,0,0.25)] ${alignRight ? "right-0" : "left-0"}`}
          >
            {spot.title && <p className="font-bold text-[20px] leading-[1.1] tracking-[-0.4px]">{spot.title}</p>}
            {text && (
              <p
                className="mt-1 text-[14px] leading-4 tracking-[-0.28px]"
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
      className="relative overflow-hidden pt-12 lg:pt-[72px]"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, #000 0%, rgba(0,0,0,0) 100%), linear-gradient(90deg, #0b2533 0%, #0b2533 100%)",
      })}
    >
      {data.heading && (
        <div className="cs-container">
          <h2
            className="cs-h2 cs-highlight mx-auto max-w-[839px] text-center text-(--color-light-grey)"
            dangerouslySetInnerHTML={{ __html: toHtml(data.heading) }}
          />
        </div>
      )}

      {imageUrl && (
        <div className="relative mx-auto w-full max-w-[1512px] aspect-[1512/767]">
          <Image
            src={imageUrl}
            alt={image?.alt || ""}
            fill
            sizes="100vw"
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
