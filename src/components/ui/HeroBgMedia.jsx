// src/components/ui/HeroBgMedia.jsx
// Hero background with separate mobile media (ACF mobile_bg_image / mobile_bg_video) — HomeHero, InnerHero.
// Callers resolve the fallbacks (mobile_* || default) and render this only when a mobile field is set;
// with no mobile field they keep their original markup. One <picture> picks the still per viewport (only that
// file downloads); the video mounts after hydration on the viewport that plays it (key = src: crossing md swaps it).

"use client";

import React from "react";
import { getImageProps } from "next/image";

// Mobile = below Tailwind md (768px) — same query as HomeHelpTabs / ProductTestimonials
export const MOBILE_MQ = "(max-width: 767.98px)";
const subscribeMobile = (onChange) => {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const isMobileViewport = () => window.matchMedia(MOBILE_MQ).matches;
const viewportUnknown = () => null; // server + hydration render: viewport not known yet

/** true / false on the client, null during SSR and hydration */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribeMobile, isMobileViewport, viewportUnknown);
}

// 1×1 transparent GIF for a <picture> slot whose viewport shows no image, so no file is fetched there
const BLANK_IMG = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export default function HeroBgMedia({
  mobileStill = "",
  desktopStill = "",
  mobileVideo = "",
  desktopVideo = "",
  imgClassName = "object-cover",
  videoClassName = "absolute inset-0 w-full h-full object-cover",
  preload,
}) {
  const isMobile = useIsMobile();
  const activeVideo = isMobile === null ? "" : isMobile ? mobileVideo : desktopVideo;

  return (
    <>
      {(mobileStill || desktopStill) && (
        <picture>
          <source media={MOBILE_MQ} srcSet={mobileStill || BLANK_IMG} />
          <img
            {...getImageProps({
              src: desktopStill || BLANK_IMG,
              alt: "",
              fill: true,
              priority: true,
              className: imgClassName,
            }).props}
            alt=""
            fetchPriority="high"
          />
        </picture>
      )}
      {activeVideo && (
        <video key={activeVideo} src={activeVideo} autoPlay loop muted playsInline preload={preload} className={videoClassName} />
      )}
    </>
  );
}
