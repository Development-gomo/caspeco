"use client";

// Loads the consent banner (Cookiebot) and Google Tag Manager AFTER the page is usable: on the first interaction
// (scroll, tap, key, pointer) or FALLBACK_MS after the window load event, whichever comes first. Both scripts are
// heavy (hundreds of ms of main-thread work) and used to run during the first load, which dominates mobile
// Total Blocking Time. Nothing is tracked in the meantime: Google Consent Mode defaults (everything denied) are set
// inline in <head> before this runs (app/[lang]/layout.js), and Cookiebot sends the visitor's choice when it loads.

import { useEffect } from "react";

const FALLBACK_MS = 5000;
const EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"];

function addScript(attrs) {
  const el = document.createElement("script");
  el.async = true;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.head.appendChild(el);
}

export default function ThirdPartyLoader({ cookiebotId = "", culture = "en", gtmId = "" }) {
  useEffect(() => {
    if (!cookiebotId && !gtmId) return;
    let started = false;
    let timer;

    const start = () => {
      if (started) return;
      started = true;
      cleanup();
      if (cookiebotId && !document.getElementById("Cookiebot")) {
        addScript({ id: "Cookiebot", src: "https://consent.cookiebot.com/uc.js", "data-cbid": cookiebotId, "data-blockingmode": "auto", "data-culture": culture });
      }
      if (gtmId && !document.querySelector('script[src*="googletagmanager.com/gtm.js"]')) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
        addScript({ src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}` });
      }
    };
    const onLoad = () => {
      timer = setTimeout(start, FALLBACK_MS);
    };
    function cleanup() {
      EVENTS.forEach((e) => window.removeEventListener(e, start));
      window.removeEventListener("load", onLoad);
      clearTimeout(timer);
    }

    EVENTS.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return cleanup;
  }, [cookiebotId, culture, gtmId]);

  return null;
}
