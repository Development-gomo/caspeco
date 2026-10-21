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
const GRADIENT = "linear-gradient(180deg, #e4e5e6 0%, #fdfdfd 100%)";

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

  const { heading, text, cta_text, cta_url, image } = data || {};
  const video = mediaUrl(data?.video) || data?.video_url || "";
  if (!heading && rolling.length === 0) return null;

  const variant = data?.cta_variant === "outline" ? "outline-dark" : "yellow";
  const headingClass = "cs-h2 cs-highlight cs-rich text-black";

  return (
    <section className="overflow-hidden py-18 lg:py-36" style={sectionBackground(data, { backgroundImage: GRADIENT })}>
      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <Reveal className="flex max-w-[600px] flex-col items-start gap-6 lg:gap-10">
          <div className="flex flex-col gap-5">
            {rolling.length > 0 ? (
              // Rotating question: grid stack keeps the height of the longest line, no jumps
              <h2 className={`${headingClass} grid`} aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={index}
                    className="col-start-1 row-start-1"
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
            {text && <div className="cs-p2 cs-rich max-w-[474px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(text) }} />}
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
          <Reveal x={40} y={0} delay={0.15} className="w-full lg:max-w-[608px] lg:flex-1">
            <Image
              src={mediaUrl(image)}
              alt={image?.alt || ""}
              width={image?.width || 1216}
              height={image?.height || 684}
              sizes="(min-width: 1024px) 608px, 100vw"
              className="ml-auto h-auto w-full rounded-[8px] shadow-[0px_4px_24px_rgba(0,0,0,0.12)]"
            />
          </Reveal>
        )}
      </div>

      {video && <VideoModal open={videoOpen} url={video} title={cta_text} onClose={() => setVideoOpen(false)} />}
    </section>
  );
}
