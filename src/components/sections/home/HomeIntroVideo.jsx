// src/components/sections/home/HomeIntroVideo.jsx
// ACF layout: intro_video_section — "We know the / average bill" rolling text + video.
// video_url plays in the box: files in a <video>, YouTube / Vimeo / Loom in an iframe loaded on click.
// Play / pause: "Watch Video" and the yellow circle toggle files, YouTube and Vimeo (postMessage APIs); Loom only starts.
// testimonial_ui ("enable"): testimonial look — video left on lg+, quote icon, sub_heading = quote,
// short_text = name (bold) + role, teal bar above them. Default "disable" = unchanged.
// centered_content ("enable"): one centred column — heading, rolling words, text, button, then the video below.

"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import { rows, sectionBackground, toHtml } from "@/lib/content";
import { embedUrl, videoUrl, youtubePoster } from "@/lib/video";

const ROLL_INTERVAL_MS = 2600;
const YT_ORIGIN = "https://www.youtube.com";
const VIMEO_ORIGIN = "https://player.vimeo.com";

export default function HomeIntroVideo({ data }) {
  const words = rows(data?.rolling_words).map((r) => r.short_text || r.word).filter(Boolean);
  // video_url is an ACF url field; data.video is the old file field
  const videoSrc = videoUrl(data?.video_url) || videoUrl(data?.video);
  const embed = videoSrc ? embedUrl(videoSrc) : null; // null → direct file, plays in <video>
  const poster = videoUrl(data?.poster_image) || youtubePoster(videoSrc);
  const { heading, sub_heading, short_text, cta_text } = data || {};
  const label = cta_text;
  const testimonial = data?.testimonial_ui === "enable";
  const centered = data?.centered_content === "enable";
  // Players we can pause / resume; Loom and other embeds have no API here (null) and only start on click
  const player = !embed
    ? "file"
    : embed.startsWith(`${YT_ORIGIN}/`)
      ? "youtube"
      : embed.startsWith(`${VIMEO_ORIGIN}/`)
        ? "vimeo"
        : null;
  // enablejsapi lets the YouTube player take postMessage commands and report its state
  const src = player === "youtube" ? `${embed}${embed.includes("?") ? "&" : "?"}enablejsapi=1` : embed;

  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false); // started (iframe mounted / controls shown)
  const [isPlaying, setIsPlaying] = React.useState(false); // playing right now
  const videoRef = React.useRef(null);
  const iframeRef = React.useRef(null);

  React.useEffect(() => {
    if (words.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), ROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [words.length]);

  // Player state from the YouTube / Vimeo iframe, only once it exists; messages from other frames are ignored
  React.useEffect(() => {
    if (!playing || (player !== "youtube" && player !== "vimeo")) return;
    const origin = player === "youtube" ? YT_ORIGIN : VIMEO_ORIGIN;
    const onMessage = (e) => {
      if (e.origin !== origin || e.source !== iframeRef.current?.contentWindow) return;
      let msg = e.data;
      if (typeof msg === "string") {
        try {
          msg = JSON.parse(msg);
        } catch {
          return;
        }
      }
      if (!msg || typeof msg !== "object") return;
      if (player === "youtube") {
        // YT states: 1 playing, 2 paused, 0 ended
        const state = msg.event === "onStateChange" ? msg.info : msg.event === "infoDelivery" ? msg.info?.playerState : undefined;
        if (state === 1) setIsPlaying(true);
        else if (state === 2 || state === 0) setIsPlaying(false);
      } else if (msg.event === "play") setIsPlaying(true);
      else if (msg.event === "pause" || msg.event === "ended") setIsPlaying(false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [playing, player]);

  if (!toHtml(heading) && !words.length && !toHtml(short_text) && !videoSrc) return null;

  // Subscribe to the embed's play / pause events once its player has loaded
  const onEmbedLoad = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    if (player === "youtube") {
      win.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), YT_ORIGIN);
      win.postMessage(
        JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"], id: 1, channel: "widget" }),
        YT_ORIGIN,
      );
    } else if (player === "vimeo") {
      ["play", "pause", "ended"].forEach((value) =>
        win.postMessage(JSON.stringify({ method: "addEventListener", value }), VIMEO_ORIGIN),
      );
    }
  };

  // First click starts: embeds mount their iframe (autoplay) only now, so nothing loads from YouTube / Vimeo
  // before the click. Later clicks pause / resume (no-op for Loom and other embeds).
  const togglePlay = () => {
    if (!playing) {
      setPlaying(true);
      videoRef.current?.play();
      return;
    }
    if (player === "file") {
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) v.play();
      else v.pause();
      return;
    }
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    if (player === "youtube") {
      win.postMessage(
        JSON.stringify({ event: "command", func: isPlaying ? "pauseVideo" : "playVideo", args: [] }),
        YT_ORIGIN,
      );
    } else if (player === "vimeo") {
      win.postMessage(JSON.stringify({ method: isPlaying ? "pause" : "play" }), VIMEO_ORIGIN);
    }
  };

  // Same size / colour for both; the triangle is nudged right to look centred
  const icon = isPlaying ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-6 lg:size-7 text-(--color-dark-petrol)">
      <rect x="6" y="5" width="4" height="14" rx="1.5" />
      <rect x="14" y="5" width="4" height="14" rx="1.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-[3px] size-6 lg:size-7 text-(--color-dark-petrol)">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  );

  return (
    // Mobile (Figma Home "USP's" 2517:4794): 64px top and bottom (cs-sec), H2 → sub 8, sub → body 24,
    // body Regular 16/20 #3F3E3C, body → button 24, button → video 48, video r8
    <section
      className={`cs-sec py-18 lg:py-36 ${data?._next === "home_kpi_section" ? "max-md:[--sec-pb:0px]" : ""}`}
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, rgba(218,220,221,0.8) 0.94%, rgba(255,255,255,0.5) 100.94%)",
      })}
    >
      <div className={`cs-container flex flex-col gap-12 ${centered ? "items-center" : "lg:flex-row lg:items-center lg:justify-between"}`}>
        {/* first:mt-0 — without heading / rolling words the column starts flush */}
        <div className={`flex flex-col lg:max-w-[700px] xl:max-w-[780px] ${centered ? "items-center text-center" : "items-start"}`}>
          {heading && (
            <h2 className="cs-h2 text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
          )}

          {words.length > 0 && (
            // Every phrase is rendered invisibly in the same grid cell, so the box takes the
            // size of the longest one (width and wrapped height) at every breakpoint; the
            // animated phrase sits on top. Only the vertical axis is clipped for the roll.
            <div className="cs-h2 relative grid w-full md:min-h-16 xl:min-h-[99px] overflow-y-clip pb-[0.12em] max-md:pb-2 text-(--color-yellow) rolling-words" aria-live="polite">
              {words.map((word, i) => (
                <span key={i} aria-hidden className="invisible [grid-area:1/1]">
                  {word}
                </span>
              ))}
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={index}
                  className="absolute inset-x-0 top-0"
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

          {testimonial && sub_heading && (
            <svg
              aria-hidden
              viewBox="0 0 64 50"
              fill="currentColor"
              className="mb-4 lg:mb-6 h-[35px] w-[44px] lg:h-[50px] lg:w-16 text-(--color-petrol)"
            >
              <path d="M0 50V30.2C0 13.4 8.6 3.2 24.6 0l3 7.8C19.6 10 15.8 14.8 15.4 21.6H28V50H0Z" />
              <path d="M36 50V30.2C36 13.4 44.6 3.2 60.6 0l3 7.8C55.6 10 51.8 14.8 51.4 21.6H64V50H36Z" />
            </svg>
          )}

          {sub_heading && (
            <p
              className={
                testimonial
                  ? "font-normal text-[24px] leading-[32px] max-md:text-[22px] max-md:leading-[30px] lg:text-[30px] lg:leading-[40px] tracking-[-0.6px] text-(--color-heading) first:mt-0"
                  : "font-bold text-[18px] leading-[22px] xl:text-[23px] xl:leading-[23px] tracking-[-0.46px] text-black xl:-mt-[12px] first:mt-0 max-md:tracking-[-0.36px] max-md:text-(--color-grey-dark)"
              }
            >
              {sub_heading}
            </p>
          )}

          {testimonial && short_text && (
            <div aria-hidden className="mt-8 lg:mt-10 h-[3px] w-12 rounded-full bg-(--color-petrol)" />
          )}

          {short_text && (
            <div
              className={
                testimonial
                  ? "cs-rich mt-5 max-w-[474px] text-[14px] leading-[18px] text-(--color-grey-dark) [&_strong]:text-[18px] [&_strong]:leading-[22px] [&_strong]:font-bold [&_strong]:text-black first:mt-0"
                  : "cs-p2 cs-text-sm cs-rich mt-8 xl:mt-12 max-w-[474px] text-(--color-grey-dark) max-md:mt-6 first:mt-0"
              }
              dangerouslySetInnerHTML={{ __html: toHtml(short_text) }}
            />
          )}

          {videoSrc && (
            <div className="mt-8 xl:mt-10 max-md:mt-6 max-md:w-full first:mt-0">
              <CtaButton variant="outline-dark-grey" className="max-md:w-full" onClick={togglePlay} aria-pressed={isPlaying}>
                {label}
              </CtaButton>
            </div>
          )}
        </div>

        {videoSrc && (
          <div className="group relative w-full lg:w-[568px] aspect-[568/320] shrink-0 overflow-hidden rounded-[4.675px] max-md:rounded-[8px] bg-(--color-dark-petrol)">
            {embed ? (
              playing ? (
                <iframe
                  ref={iframeRef}
                  src={src}
                  title={label}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0"
                  onLoad={onEmbedLoad}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- third-party poster (i.ytimg.com), not a WP image
                poster && <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
              )
            ) : (
              <video
                ref={videoRef}
                src={videoSrc}
                poster={poster || undefined}
                controls={playing}
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
                onPlay={() => {
                  setPlaying(true);
                  setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            )}
            {!playing ? (
              <button
                type="button"
                onClick={togglePlay}
                aria-label={label}
                className="group absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-(--color-yellow)"
              >
                <span
                  aria-hidden
                  className="pointer-events-none flex size-14 lg:size-[72px] items-center justify-center rounded-full bg-(--color-yellow) shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-transform duration-200 group-hover:scale-105"
                >
                  {icon}
                </span>
              </button>
            ) : (
              // After start only the circle takes clicks, so the player's own controls stay usable;
              // hidden while playing until the box is hovered / the circle focused, always shown when paused
              player && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={label}
                    aria-pressed={isPlaying}
                    className={`pointer-events-auto flex size-14 lg:size-[72px] cursor-pointer items-center justify-center rounded-full bg-(--color-yellow) shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-[transform,opacity] duration-200 hover:scale-105 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-yellow) ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
                  >
                    {icon}
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
