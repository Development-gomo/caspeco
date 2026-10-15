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

  // Duplicate for seamless infinite loop
  const logos = [...partners_logo, ...partners_logo];

  return (
    <section
      className="partners-section relative overflow-hidden"
      style={{ background: data?.bg_color || "var(--color-light-grey)" }}
    >
      {bgImage ? (
        <div className="absolute inset-0 -z-2" style={{ backgroundImage: `url(${bgImage})`, backgroundPosition: '100% -10%', backgroundRepeat: 'no-repeat', backgroundSize: 'auto' }} suppressHydrationWarning />
      ) : null}

      {/* MARQUEE SLIDER — Figma "Customer logos desktop": plain dark logos, 120px apart, 97px strip */}
      <div className="partners-marquee-mask overflow-hidden">
        <div
          className="partners-marquee-track flex items-center h-[97px]"
          style={{
            width: "max-content",
            animation: "partners-marquee 30s linear infinite",
          }}
        >
          {logos.map((logo, index) => (
            <div key={index} className="flex items-center justify-center shrink-0 pr-16 lg:pr-[120px]">
              <Image
                src={logo.url}
                alt={logo.alt || logo.title || ""}
                width={logo.width || 120}
                height={34}
                className="partner-logo h-[34px] w-auto max-w-[120px] object-contain "
              />
            </div>
          ))}
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
