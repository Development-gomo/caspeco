// src/components/sections/product/CheckList.jsx
// Figma "USP lista": grey check + Tenon X-Bold 20/24 line, 8px apart.
// `items` is an ACF repeater of { item } (the feature slider's sub field is named "items").

import Image from "next/image";
import CheckIcon from "../../../../public/icons/home/check.svg";
import CheckYellow from "../../../../public/icons/home/check-yellow.svg";
import { rows } from "@/lib/content";

// onDark: below 768px the list sits on a dark image panel — light text and a yellow check (Figma "Benefits")
export default function CheckList({ items, className = "", onDark = false }) {
  const list = rows(items).map((r) => r.item || r.items || r.text).filter(Boolean);
  if (!list.length) return null;
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {list.map((item, i) => (
        <li key={i} className={`flex items-center gap-2 font-extrabold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-(--color-grey-dark) ${onDark ? "max-md:text-(--color-light-grey)" : ""}`}>
          <Image src={CheckIcon} alt="" width={14} height={16} className={`shrink-0 ${onDark ? "max-md:hidden" : ""}`} />
          {onDark && <Image src={CheckYellow} alt="" width={14} height={16} className="shrink-0 mt-[3px] md:hidden" />}
          {item}
        </li>
      ))}
    </ul>
  );
}
