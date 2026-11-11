// src/components/sections/icp/IcpIntro.jsx
// ACF layout: icp_intro_section — ICP page intro (Figma "Intro" on Opening soon,
// "Inro section" on Levelling up): heading, text, optional CTA and an image on the right.
// rolling_headings (optional) replaces the heading with questions that rotate in place
// ("Chasing staff to fill shifts?" …). If a video is set, the CTA opens it in a popup.
// anchor_link (ACF, content_section) → section id so #hash links scroll to it (header offset via scroll-mt).

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
// bg_gradient (ACF button group) → class defined in globals.css: top = grey at the top fading to white (Figma fill
// #DADCDD 80% → #FFFFFF 50%), bottom = white fading to grey (same fill as the Switch steps section), none = plain
// page background, full = solid #f1f1f1 (whole section). Unset keeps the top gradient.
// ICP intro only (not the Page Builder content_section, data.listStyle): on mobile the gradient is the Figma one
// (178deg, fade stretched past the bottom edge — .bg-icp-intro-m in globals.css) and the CTA is the ghost
// outline-dark-grey button (two buttons, max-md:hidden / md:hidden, like the Home tabs); desktop unchanged.
const GRADIENT_CLASSES = { top: "bg-topgrad", bottom: "bg-bottomgrad", none: "bg-none", full: "bg-full" };

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
  // Page Builder content_section may have only text / CTA / image (no heading)
  if (!heading && rolling.length === 0 && !text && !mediaUrl(image)) return null;

  const icpMobile = !data?.listStyle; // ICP intro (content_section keeps its own look)
  const fitImage = !!data?.listStyle; // content_section images are capped to the text height on desktop
  const variant = data?.cta_variant === "outline" ? "outline-dark" : "yellow";
  // mobile (Figma "USP's"): heading #151411 (desktop stays #000)
  const headingClass = "cs-h3 cs-highlight cs-rich text-(--color-heading) max-md:text-(--color-black)";
  // stacked content_sections: drop the top padding only when the edge between them is the same background
  const gradient = data?.bg_gradient || "top";
  const prevGradient = data?._prevGradient || "top";
  const prevBottomGrey = prevGradient === "bottom" || prevGradient === "full";
  const topGrey = gradient === "top" || gradient === "full";
  const stackedAfterContent =
    data?._prev === "content_section" &&
    ((!prevBottomGrey && !topGrey) || (prevGradient === "full" && gradient === "full"));

  const anchorId = String(data?.anchor_link || "").trim().replace(/^#+/, "").replace(/\s+/g, "-");

  return (
    // Figma section-gap rule: before the light tabs section the intro keeps 72 below (72 + 72)
    // Mobile (Figma "USP's"): 64 top/bottom, text block → image 40, heading → text 16
    <section id={anchorId || undefined} className={`cs-sec scroll-mt-[72px] lg:scroll-mt-[84px] overflow-hidden ${stackedAfterContent ? "pt-0" : "pt-18 lg:pt-36"} ${GRADIENT_CLASSES[data?.bg_gradient] || GRADIENT_CLASSES.top} ${icpMobile && !GRADIENT_CLASSES[data?.bg_gradient] ? "bg-icp-intro-m" : ""} ${data?._next === "tab_section" ? "pb-12 lg:pb-[72px]" : "pb-18 lg:pb-36"}`} style={sectionBackground(data)}>
      {/* image_postion "left" (Page Builder content_section): image first on desktop */}
      <div className={`cs-container flex flex-col gap-12 max-md:gap-10 lg:items-center lg:justify-between lg:gap-16 ${data?.image_postion === "left" ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        {/* Opening soon: text 600 wide, centred on the image; Levelling up: rotating heading 850 wide, text 474 */}
        <Reveal className={`flex flex-col items-start gap-6 lg:gap-10 ${rolling.length ? "max-w-[850px]" : "max-w-[600px]"}`}>
          <div className="flex flex-col gap-5 max-md:gap-4">
            {rolling.length > 0 ? (
              // Rotating question: grid stack keeps the height of the longest line, no jumps
              // Figma "ICP_levelling_up_scroll_text": 176px box = heading + 10px above and below
              <h2 className={`${headingClass} grid lg:py-2.5`} aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={index}
                    // Figma: #000 (mobile #151411) — important, because the global ".cs-h2 span" rule turns spans yellow
                    className="col-start-1 row-start-1 text-(--color-heading)! max-md:text-(--color-black)!"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    dangerouslySetInnerHTML={{ __html: toHtml(rolling[index]) }}
                  />
                </AnimatePresence>
              </h2>
            ) : (
              heading && <h2 className={headingClass} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            )}
            {text && (
              // Figma: Regular 20/24 #3F3E3C; the emphasised phrase is Medium Italic #000
              // Mobile: 18/20 (Opening soon) or 16/20 (Levelling up, rolling heading); emphasis on the same 20px line
              <div
                className={`cs-p2 cs-rich text-(--color-grey-dark) [&_em]:font-medium [&_em]:leading-8 [&_em]:text-(--color-heading) [&_strong]:font-medium [&_strong]:leading-8 [&_strong]:text-(--color-heading) max-md:[&_em]:text-(--color-grey-dark) max-md:[&_strong]:text-(--color-grey-dark) max-md:leading-5! max-md:[&_em]:leading-5 max-md:[&_strong]:leading-5 ${data?.listStyle ? "cs-list" : ""} ${rolling.length ? "max-w-[474px] max-md:text-[16px]! max-md:tracking-[-0.32px]!" : "max-w-[600px]"}`}
                dangerouslySetInnerHTML={{ __html: toHtml(text) }}
              />
            )}
          </div>

          {cta_text &&
            (video ? (
              <>
                <CtaButton variant={variant} onClick={() => setVideoOpen(true)} className={icpMobile ? "max-md:hidden" : undefined}>
                  {cta_text}
                </CtaButton>
                {icpMobile && (
                  <CtaButton variant="outline-dark-grey" onClick={() => setVideoOpen(true)} className="md:hidden">
                    {cta_text}
                  </CtaButton>
                )}
              </>
            ) : (
              cta_url && (
                <>
                  <CtaButton variant={variant} href={langHref(cta_url.trim(), lang)} className={icpMobile ? "max-md:hidden" : undefined}>
                    {cta_text}
                  </CtaButton>
                  {icpMobile && (
                    <CtaButton variant="outline-dark-grey" href={langHref(cta_url.trim(), lang)} className="md:hidden">
                      {cta_text}
                    </CtaButton>
                  )}
                </>
              )
            ))}
        </Reveal>

        {mediaUrl(image) && (
          // Figma: 608×342 (Opening soon) / 369×369 (Levelling up), radius 8, no shadow
          // content_section (desktop): tall images are fitted inside the text column height instead of growing taller
          <Reveal x={40} y={0} delay={0.15} className={`w-full lg:flex-none ${rolling.length ? "lg:w-[369px]" : "lg:w-[608px]"}${fitImage ? " lg:relative lg:self-stretch lg:min-h-[342px]" : ""}`}>
            <Image
              src={mediaUrl(image)}
              alt={image?.alt || ""}
              width={image?.width || 1216}
              height={image?.height || 684}
              sizes="(min-width: 1024px) 608px, 100vw"
              className="rounded-lg object-cover lg:rounded-none lg:object-contain"
            />
          </Reveal>
        )}
      </div>

      {video && <VideoModal open={videoOpen} url={video} title={cta_text} onClose={() => setVideoOpen(false)} />}
    </section>
  );
}
