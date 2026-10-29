"use client";

// The "One platform / One partner / One login" row shown at the top of every hero
// (client request: all hero layouts). ACF: `label` repeater of { label, link }, max 3.
// If the field is empty (or the layout doesn't have it) the three DEFAULT_LABELS show.
// Links that are empty or "#" render as plain text. Fades in on load.
// Mobile (Figma "USP section"): Tenon X-Bold 14/16, -2%, #FDFDFD, 16px apart.

import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_LANG, langHref } from "@/config";

// Shown when the hero's ACF label repeater is empty
const DEFAULT_LABELS = [{ label: "One platform" }, { label: "One partner" }, { label: "One login" }];

export default function HeroLabels({ labels, lang = DEFAULT_LANG, className = "" }) {
  const filled = (Array.isArray(labels) ? labels : []).filter((row) => row?.label);
  const items = filled.length ? filled : DEFAULT_LABELS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`flex flex-wrap items-center gap-4 lg:gap-8 font-extrabold text-[16px] lg:text-[20px] leading-[22px] text-white max-md:text-[14px] max-md:leading-4 max-md:tracking-[-0.28px] max-md:text-(--color-light-grey) ${className}`}
    >
      {items.map((row, i) =>
        row.link && row.link.trim() !== "#" ? (
          <Link key={i} href={langHref(row.link.trim(), lang)} className="cs-link-draw">
            {row.label}
          </Link>
        ) : (
          <span key={i}>{row.label}</span>
        ),
      )}
    </motion.div>
  );
}
