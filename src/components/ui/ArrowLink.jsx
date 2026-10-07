// src/components/ui/ArrowLink.jsx
// Figma "Text CTA / Link and arrow": underlined Tenon Medium 16/20 + 16px arrow.
// tone="petrol" on light backgrounds, tone="light" (white text, yellow arrow) on dark.

import Link from "next/link";
import Image from "next/image";
import ArrowPetrol from "../../../public/icons/home/arrow-petrol.svg";
import ArrowLight from "../../../public/icons/home/arrow-light.svg";

export default function ArrowLink({ href, children, tone = "petrol", className = "" }) {
  if (!href || !children) return null;
  const color = tone === "light" ? "text-(--color-light-grey)" : "text-(--color-petrol)";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-[16px] leading-5 font-medium tracking-[-0.32px] ${color} ${className}`}
    >
      <span className="underline decoration-1 underline-offset-2">{children}</span>
      <Image
        src={tone === "light" ? ArrowLight : ArrowPetrol}
        alt=""
        width={17.5}
        height={11}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}
