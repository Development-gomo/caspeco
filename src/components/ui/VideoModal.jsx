// src/components/ui/VideoModal.jsx
// Popup video player. Plays uploaded files (mp4/webm…) in a <video>, and
// YouTube / Vimeo links in an embedded player. Closes on Esc, backdrop click or ×.

"use client";

import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Uploaded / direct video files play in a <video>; YouTube and Vimeo in their players;
// any other link (Loom, Wistia, a hosted player page …) is embedded as an iframe.
const FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#]|$)/i;

// "1m30s" / "90" → 90
const seconds = (t) => {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
};

function embedUrl(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m)\./, "");

  // YouTube: watch?v=, youtu.be/, embed/, shorts/, live/, v/ and youtube-nocookie.com
  const yt =
    (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com"
      ? u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1]
      : host === "youtu.be"
        ? u.pathname.slice(1, 12)
        : null) || null;
  if (yt) {
    const start = seconds(u.searchParams.get("t") || u.searchParams.get("start"));
    return `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0${start ? `&start=${start}` : ""}`;
  }

  // Vimeo: vimeo.com/123, vimeo.com/123/<hash> (unlisted), /channels|groups/…/123, player.vimeo.com/video/123?h=…
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(?:^|\/)(\d{6,})(?:\/([\da-f]{6,}))?/i);
    if (m) {
      const hash = m[2] || u.searchParams.get("h");
      return `https://player.vimeo.com/video/${m[1]}?autoplay=1${hash ? `&h=${hash}` : ""}`;
    }
  }

  // Loom share links have an embed twin
  if (host === "loom.com") {
    const id = u.pathname.match(/\/(?:share|embed)\/([\w-]+)/)?.[1];
    if (id) return `https://www.loom.com/embed/${id}?autoplay=1`;
  }

  return FILE.test(u.pathname) ? null : url;
}

export default function VideoModal({ open, url, title = "", onClose }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  const embed = url ? embedUrl(url) : null;

  return createPortal(
    <AnimatePresence>
      {open && url && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[1100px]"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-[28px] leading-none text-white transition-colors hover:bg-white/30"
            >
              ×
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-[8px] bg-black">
              {embed ? (
                <iframe src={embed} title={title} className="h-full w-full" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />
              ) : (
                <video src={url} className="h-full w-full" controls autoPlay playsInline />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
