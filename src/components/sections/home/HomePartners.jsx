// src/components/sections/home/HomePartners.jsx
// Logos come from Theme Settings → Partners Logo (`logos`, shared by all languages);
// the section's own partners_logo gallery is only a fallback for older pages.

"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function HomePartners({ data, logos: themeLogos }) {
  if (!data) return null;

  const { sub_heading, heading } = data;
  // skip entries without a URL (e.g. bare media IDs) — an empty src breaks next/image
  const source = themeLogos?.length ? themeLogos : data?.partners_logo;
  const partners_logo = (Array.isArray(source) ? source : []).filter((logo) => logo?.url);
  const bgImage = data?.bg_image?.url || "";

  if (partners_logo.length === 0) return null;

  // Seamless infinite loop: the track is two identical halves and slides by exactly -50%. Each half must be wider than the
  // screen, or the right side runs empty before the jump back (the glitch at the end of the slide), so a short list is
  // repeated up to MIN_PER_HALF logos first. The duration scales with that, so the speed stays the same as before.
  const LOGO_H = 45; // desktop logo height in px - keep in sync with the h-[45px] class below
  const MIN_PER_HALF = 16;
  const repeat = Math.max(1, Math.ceil(MIN_PER_HALF / partners_logo.length));
  const half = Array.from({ length: repeat }, () => partners_logo).flat();
  const logos = [...half, ...half];
  const duration = 60 * repeat;

  return (
    <section
      className="partners-section relative overflow-hidden"
      style={{ background: data?.bg_color || "var(--color-light-grey)" }}
    >
      {bgImage ? (
        <div className="absolute inset-0 -z-2" style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: '100% -10%', backgroundRepeat: 'no-repeat', backgroundSize: 'auto' }} suppressHydrationWarning />
      ) : null}

      <div className="partners-marquee-mask overflow-hidden">
        <div
          className="partners-marquee-track flex items-center h-[97px] max-md:h-16"
          style={{
            width: "max-content",
            animation: `partners-marquee ${duration}s linear infinite`,
            willChange: "transform",
          }}
        >
          {logos.map((logo, index) => {
            // Fixed box from the media's own width / height: the width is known before the image loads, so the track never
            // changes width mid-animation (the old fixed 34px height vs the real aspect ratio shifted ~100px as logos
            // loaded, which made the strip jump). Pinned with min/max-width because globals.css sets .partner-logo { width: auto }. Same caps as before: LOGO_H tall, at most 120px wide (mobile 19px / 69px).
            const ratio = logo.width && logo.height ? logo.width / logo.height : 2.3;
            const boxW = Math.round(Math.min(120, LOGO_H * ratio) * 100) / 100; // desktop / tablet
            const boxWMobile = Math.round(Math.min(69, 19 * ratio) * 100) / 100;
            return (
              <div key={index} className="flex items-center justify-center shrink-0 pr-16 lg:pr-[120px] max-md:pr-6">
                <Image
                  src={logo.url}
                  alt={logo.alt || logo.title || ""}
                  width={logo.width || 120}
                  height={logo.height || 45}
                  // eager: lazy logos in the off-screen half would pop in right when the loop wraps
                  loading="eager"
                  style={{ "--w": `${boxW}px`, "--wm": `${boxWMobile}px` }}
                  className="partner-logo h-[45px] min-w-(--w) max-w-(--w) object-contain max-md:h-[19px] max-md:min-w-(--wm) max-md:max-w-(--wm)"
                />
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes partners-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .partners-marquee-mask {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0,
            #000 64px,
            #000 calc(100% - 64px),
            transparent 100%
          );
          mask-image: linear-gradient(
            to right,
            transparent 0,
            #000 64px,
            #000 calc(100% - 64px),
            transparent 100%
          );
        }
        .partners-marquee-mask:hover .partners-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .partners-marquee-track {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
