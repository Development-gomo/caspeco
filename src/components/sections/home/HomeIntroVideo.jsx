// src/components/sections/home/HomeIntroVideo.jsx
// ACF layout: intro_video_section — "We know the / average bill" rolling text + video.

"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const ROLL_INTERVAL_MS = 2600;

export default function HomeIntroVideo({ data, lang = DEFAULT_LANG }) {
  const words = rows(data?.rolling_words).map((r) => r.short_text || r.word).filter(Boolean);
  const videoSrc = mediaUrl(data?.video_url) || mediaUrl(data?.video);
  const poster = mediaUrl(data?.poster_image);
  const { heading, sub_heading, short_text, cta_text, cta_url } = data || {};

  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), ROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  const playVideo = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  // "Watch video" plays the inline video; without a video it falls back to the CTA URL.
  const button = cta_text
    ? videoSrc
      ? <CtaButton variant="outline-dark" onClick={playVideo}>{cta_text}</CtaButton>
      : cta_url && <CtaButton variant="outline-dark" href={langHref(cta_url, lang)}>{cta_text}</CtaButton>
    : null;

  return (
    <section
      className="py-18 lg:py-36"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, rgba(218,220,221,0.8) 0.94%, rgba(255,255,255,0.5) 100.94%)",
      })}
    >
      <div className="cs-container flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
        <div className="flex flex-col items-start lg:max-w-[691px]">
          {heading && (
            <h2 className="cs-h2 text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
          )}

          {words.length > 0 && (
            // Two lines of room on mobile so long phrases ("top performing drink") can wrap
            <div className="cs-h2 relative h-[88px] md:h-[64px] xl:h-[99px] w-full overflow-hidden text-(--color-yellow)" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  className="absolute inset-x-0 top-0 md:whitespace-nowrap"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          {sub_heading && (
            <p className="font-bold text-[18px] leading-[22px] xl:text-[23px] xl:leading-[23px] tracking-[-0.46px] text-(--color-black) xl:-mt-[5px]">
              {sub_heading}
            </p>
          )}

          {short_text && (
            <p
              className="cs-p2 mt-8 xl:mt-[47px] max-w-[474px] text-(--color-grey-dark)"
              dangerouslySetInnerHTML={{ __html: toHtml(short_text) }}
            />
          )}

          {button && <div className="mt-8 xl:mt-10">{button}</div>}
        </div>

        {videoSrc && (
          <div className="relative w-full lg:w-[568px] aspect-[568/320] shrink-0 overflow-hidden rounded-[4.675px] bg-(--color-dark-petrol)">
            <video
              ref={videoRef}
              src={videoSrc}
              poster={poster || undefined}
              controls={playing}
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
              onPlay={() => setPlaying(true)}
            />
            {!playing && (
              <button
                type="button"
                onClick={playVideo}
                aria-label={cta_text || "Play video"}
                className="absolute inset-0 cursor-pointer"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
