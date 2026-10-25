// src/components/sections/icp/IcpIntro.jsx
// ACF layout: icp_intro_section — ICP page intro (Figma "Intro" on Opening soon,
// "Inro section" on Levelling up): heading, text, optional CTA and an image on the right.
// rolling_headings (optional) replaces the heading with questions that rotate in place
// ("Chasing staff to fill shifts?" …). If a video is set, the CTA opens it in a popup.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import VideoModal from "@/components/ui/VideoModal";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const ROLL_MS = 3200;
// Figma fill: linear #DADCDD 80% → #FFFFFF 50% (over the white page)
const GRADIENT = "linear-gradient(180deg, rgba(218, 220, 221, 0.80) 0%, rgba(255, 255, 255, 0.50) 100%), #FFF";

export default function IcpIntro({ data, lang = DEFAULT_LANG }) {
  const rolling = rows(data?.rolling_headings).map((r) => r.text).filter(Boolean);
  const [index, setIndex] = React.useState(0);
  const [videoOpen, setVideoOpen] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (rolling.length < 2 || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % rolling.length), ROLL_MS);
    return () => clearInterval(id);
  }, [rolling.length, reduce]);

  const { heading, cta_text, cta_url, image } = data || {};
  const text = data?.text || data?.short_text; // short_text in "Page Builder ICP Page"
  const video = mediaUrl(data?.video) || data?.video_url || "";
  if (!heading && rolling.length === 0) return null;

  const variant = data?.cta_variant === "outline" ? "outline-dark" : "yellow";
  const headingClass = "cs-h2 cs-highlight cs-rich text-(--color-heading)";

  return (
    // Figma section-gap rule: before the light tabs section the intro keeps 72 below (72 + 72)
    <section className={`overflow-hidden pt-18 lg:pt-36 ${data?._next === "tab_section" ? "pb-12 lg:pb-[72px]" : "pb-18 lg:pb-36"}`} style={sectionBackground(data, { background: GRADIENT })}>
      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Opening soon: text 600 wide, centred on the image; Levelling up: rotating heading 850 wide, text 474 */}
        <Reveal className={`flex flex-col items-start gap-6 lg:gap-10 ${rolling.length ? "max-w-[850px]" : "max-w-[600px]"}`}>
          <div className="flex flex-col gap-5">
            {rolling.length > 0 ? (
              // Rotating question: grid stack keeps the height of the longest line, no jumps
              // Figma "ICP_levelling_up_scroll_text": 176px box = heading + 10px above and below
              <h2 className={`${headingClass} grid lg:py-2.5`} aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={index}
                    className="col-start-1 row-start-1"
                    // Figma: #000 — inline, because the global ".cs-h2 span" rule turns spans yellow
                    style={{ color: "var(--color-heading)" }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    dangerouslySetInnerHTML={{ __html: toHtml(rolling[index]) }}
                  />
                </AnimatePresence>
              </h2>
            ) : (
              <h2 className={headingClass} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            )}
            {text && (
              // Figma: Regular 20/24 #3F3E3C; the emphasised phrase is Medium Italic #000
              <div
                className={`cs-p2 cs-rich text-(--color-grey-dark) [&_em]:font-medium [&_em]:leading-8 [&_em]:text-(--color-heading) [&_strong]:font-medium [&_strong]:leading-8 [&_strong]:text-(--color-heading) ${rolling.length ? "max-w-[474px]" : "max-w-[600px]"}`}
                dangerouslySetInnerHTML={{ __html: toHtml(text) }}
              />
            )}
          </div>

          {cta_text &&
            (video ? (
              <CtaButton variant={variant} onClick={() => setVideoOpen(true)}>
                {cta_text}
              </CtaButton>
            ) : (
              cta_url && (
                <CtaButton variant={variant} href={langHref(cta_url.trim(), lang)}>
                  {cta_text}
                </CtaButton>
              )
            ))}
        </Reveal>

        {mediaUrl(image) && (
          // Figma: 608×342 (Opening soon) / 369×369 (Levelling up), radius 8, no shadow
          <Reveal x={40} y={0} delay={0.15} className={`w-full lg:flex-none ${rolling.length ? "lg:w-[369px]" : "lg:w-[608px]"}`}>
            <Image
              src={mediaUrl(image)}
              alt={image?.alt || ""}
              width={image?.width || 1216}
              height={image?.height || 684}
              sizes="(min-width: 1024px) 608px, 100vw"
              className="ml-auto h-auto w-full rounded-[8px]"
            />
          </Reveal>
        )}
      </div>

      {video && <VideoModal open={videoOpen} url={video} title={cta_text} onClose={() => setVideoOpen(false)} />}
    </section>
  );
}
