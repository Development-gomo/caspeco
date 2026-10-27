// src/components/ui/CtaButton.jsx
// Shared CTA pill — matches the Figma "Button Desktop" component
// (rounded-full, Tenon Bold 18, no icon/animation).
// Variants: yellow (default), dark (filled grey), outline-dark, outline-dark-grey, outline-dark-gold,
// outline-light, outline-light-yellow.
// Outline variants use a 2px inside stroke, so padding is reduced by 2px to keep the 54px height.
// Renders a <button> when no href is given (e.g. "Watch video", form submit).
// Hover states follow the Figma button variants:
//   yellow / dark  → gold fill #C59A28, white label (Smart Animate 600 ms ease-out)
//   outline-dark   → yellow fill, dark stroke kept, white label (Dissolve 400 ms ease-out)
//   outline-dark-grey → dark-grey fill, dark stroke kept, light-grey label (Figma "All insights" Variant2; Insights section)
//   outline-dark-gold → gold fill, dark stroke kept, white label (Home intro video "Watch Video")
//   outline-light  → yellow fill + stroke (client request), white label (400 ms)
//   outline-light-yellow → yellow fill, white stroke kept, white label (Integrations, Industry case slider, Casper AI)
//   outline-soft-yellow → #F1F1F1 stroke + label (Figma "View all cases" on the testimonial carousel), yellow fill on hover
//   outline-light-gold → hero secondary CTA (Figma "Light / Secondary"): 2px #FDFDFD stroke + label; hover
//     fills #C59A28 (yellow under a 30% #3F3E3C layer), stroke #FFF, label stays #FDFDFD (Dissolve 100 ms ease-out)
// Hover colours differ per section on purpose — pick the variant the section's Figma uses.

import Link from "next/link";

const VARIANTS = {
  yellow: "bg-(--color-yellow) text-(--color-grey-dark) hover:bg-(--color-gold) hover:text-white duration-600 px-[38px] py-4",
  dark: "bg-(--color-grey-dark) text-(--color-light-grey) hover:bg-(--color-gold) hover:text-white duration-600 px-[38px] py-4",
  "outline-dark":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-yellow) hover:text-white duration-400 px-[36px] py-[14px]",
  "outline-dark-grey":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-grey-dark) hover:text-(--color-light-grey) duration-400 px-[36px] py-[14px]",
  "outline-dark-gold":
    "border-2 border-(--color-grey-dark) text-(--color-grey-dark) hover:bg-(--color-gold) hover:text-white duration-400 px-[36px] py-[14px]",
  "outline-light":
    "border-2 border-(--color-white) text-white hover:border-(--color-yellow) hover:bg-(--color-yellow) hover:text-white duration-400 px-[36px] py-[14px]",
  "outline-light-yellow":
    "border-2 border-(--color-white) text-white hover:bg-(--color-yellow) hover:text-white duration-400 px-[36px] py-[14px]",
  "outline-light-gold":
    "border-2 border-(--color-white) text-(--color-white) hover:border-[#FFFFFF] hover:bg-(--color-gold) duration-100 px-[36px] py-[14px]",
  "outline-soft-yellow":
    "border-2 border-[#F1F1F1] text-[#F1F1F1] hover:bg-(--color-yellow) hover:text-white duration-400 px-[36px] py-[14px]",
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
