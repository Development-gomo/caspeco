// src/components/ui/CtaButton.jsx
// Shared CTA pill — matches the Figma "Button Desktop" component
// (rounded-full, Tenon Bold 18, no icon/animation).
// Variants: yellow (default), dark (filled grey), outline-dark, outline-light.
// Outline variants use a 2px inside stroke, so padding is reduced by 2px to keep the 54px height.
// Renders a <button> when no href is given (e.g. "Watch video", form submit).

import Link from "next/link";

const VARIANTS = {
  yellow: "bg-(--color-yellow) hover:bg-(--color-yellow)/90 text-(--color-grey-dark) px-[38px] py-4",
  dark: "bg-(--color-grey-dark) hover:bg-(--color-black) text-(--color-light-grey) px-[38px] py-4",
  "outline-dark":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-grey-dark) hover:text-(--color-light-grey) px-[36px] py-[14px]",
  "outline-light":
    "border-2 border-(--color-white) text-(--color-white) hover:bg-(--color-white) hover:text-(--color-black) px-[36px] py-[14px]",
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
  const classes = `inline-flex items-center justify-center select-none cursor-pointer
    rounded-full text-[18px] leading-[22px] font-bold
    ${wrap ? "whitespace-normal text-center" : "whitespace-nowrap"}
    transition-colors duration-300
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
