"use client";

// Fade-up reveal used by server-rendered sections. Plays once when scrolled into
// view (or on mount with `onMount`, for heroes); `delay` staggers siblings.
// Respects prefers-reduced-motion.

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export default function Reveal({ as = "div", children, className, delay = 0, y = 24, x = 0, scale = 1, duration = 0.7, onMount = false, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y, x, scale };
  const shown = { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: reduce ? 0.2 : duration, delay, ease: EASE } };

  const trigger = onMount ? { animate: shown } : { whileInView: shown, viewport: { once: true, amount: 0.2 } };

  return (
    <Tag initial={hidden} {...trigger} className={className} {...rest}>
      {children}
    </Tag>
  );
}
