"use client";

// Floating "back to top" button (bottom-right). Fades in once the visitor has scrolled
// past roughly one screen, and scrolls smoothly to the top (instantly with reduced motion).
// Uses the yellow slider arrow, rotated to point up.

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ArrowActive from "../../public/icons/product/slider-arrow-active.svg";

const SHOW_AFTER_PX = 600;

export default function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed right-4 bottom-4 z-[60] cursor-pointer rounded-full shadow-[0px_4px_12px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-yellow) lg:right-8 lg:bottom-8"
        >
          <Image src={ArrowActive} alt="" width={48} height={48} className="size-11 -rotate-90 lg:size-12" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
