// src/components/ui/CtaButton.jsx
// Shared CTA pill — matches the Figma "Button Desktop" component
// (bg #FFC120, rounded-full, dark grey text, no icon/animation).

import Link from "next/link";

export default function CtaButton({ href, children, className = "", onClick, target }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      target={target}
      className={`inline-flex items-center justify-center select-none
        rounded-full bg-(--color-yellow) hover:bg-(--color-yellow)/90
        px-[38px] py-4 text-(--color-grey-dark)
        text-[18px] font-bold whitespace-nowrap
        transition-colors duration-300
        ${className}`}
    >
      {children}
    </Link>
  );
}
