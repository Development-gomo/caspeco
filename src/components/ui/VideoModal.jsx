// src/components/ui/VideoModal.jsx
// Popup video player. Plays uploaded files (mp4/webm…) in a <video>, and
// YouTube / Vimeo links in an embedded player. Closes on Esc, backdrop click or ×.

"use client";

import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

function embedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
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
