// src/components/ui/CtaButton.jsx
// Shared CTA pill — matches the Figma "Button Desktop" component
// (rounded-full, Tenon Bold 18, no icon/animation).
// Variants: yellow (default), dark (filled grey), outline-dark, outline-dark-grey, outline-dark-gold,
// outline-light, outline-light-yellow.
// Outline variants use a 2px inside stroke, so padding is reduced by 2px to keep the 54px height.
// Renders a <button> when no href is given (e.g. "Watch video", form submit).
// Secondary (outline-*) variants share one neutral hover (QA round 2, slide 38): light outline fills white with a dark label, dark outline fills grey-dark with a light label. Primary (yellow/dark) hover to gold.

import Link from "next/link";

const VARIANTS = {
  yellow: "bg-(--color-yellow) text-(--color-grey-dark) hover:bg-(--color-gold) hover:text-white duration-600 px-[38px] py-4",
  dark: "bg-(--color-grey-dark) text-(--color-light-grey) hover:bg-(--color-gold) hover:text-white duration-600 px-[38px] py-4",
  "outline-dark":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-grey-dark) hover:text-(--color-light-grey) duration-400 px-[36px] py-[14px]",
  "outline-dark-grey":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-grey-dark) hover:text-(--color-light-grey) duration-400 px-[36px] py-[14px]",
  "outline-dark-gold":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-grey-dark) hover:text-(--color-light-grey) duration-400 px-[36px] py-[14px]",
  "outline-light":
    "border-2 border-(--color-white) text-white hover:bg-(--color-white) hover:text-(--color-grey-dark) duration-400 px-[36px] py-[14px]",
  "outline-light-yellow":
    "border-2 border-(--color-white) text-white hover:bg-(--color-white) hover:text-(--color-grey-dark) duration-400 px-[36px] py-[14px]",
  "outline-light-gold":
    "border-2 border-(--color-white) text-(--color-white) hover:bg-(--color-white) hover:text-(--color-grey-dark) duration-100 px-[36px] py-[14px]",
  "outline-soft-yellow":
    "border-2 border-[#F1F1F1] text-[#F1F1F1] hover:bg-[#F1F1F1] hover:text-(--color-grey-dark) duration-400 px-[36px] py-[14px]",
};

export default function CtaButton({
  href,
  children,
  className = "",
  onClick,
  target,
  variant = "yellow",
  type = "button",
  wrap = false, // allow long labels to wrap (full-width buttons on mobile)
  ...rest
}) {
  // cs-btn: Figma "Button Mobile" size below 768px (globals.css); desktop/tablet unchanged
  const classes = `cs-btn inline-flex items-center justify-center select-none cursor-pointer
    rounded-full text-[18px] leading-[22px] font-bold
    ${wrap ? "whitespace-normal text-center" : "whitespace-nowrap"}
    transition-colors ease-out
    ${VARIANTS[variant] || VARIANTS.yellow}
    ${className}`;

  if (!href) {
    return (
      <button type={type} onClick={onClick} className={classes} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClick} target={target} className={classes} {...rest}>
      {children}
    </Link>
  );
}
