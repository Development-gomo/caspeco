"use client";

// Counts the number inside a stat ("73%", "-18 %", "23,6 %", "5h", "100+") up from 0
// when it scrolls into view, keeping the prefix/suffix and the decimal separator.
// Text without a number, and prefers-reduced-motion, render the value as-is.

import React from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

const NUMBER = /^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/s;

export default function CountUp({ value, duration = 1.4, className }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const match = typeof value === "string" ? value.match(NUMBER) : null;
  const [display, setDisplay] = React.useState(value);

  // Server HTML keeps the real value (SEO / no-JS); once hydrated, park it at 0 while
  // it's still off-screen so the count-up starts from there.
  React.useEffect(() => {
    if (match && !reduce && !inView) setDisplay(`${match[1]}0${match[3]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!match || reduce || !inView) return;
    const [, prefix, num, suffix] = match;
    const sep = num.includes(",") ? "," : ".";
    const decimals = num.split(/[.,]/)[1]?.length || 0;
    const target = parseFloat(num.replace(",", "."));
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(`${prefix}${v.toFixed(decimals).replace(".", sep)}${suffix}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
