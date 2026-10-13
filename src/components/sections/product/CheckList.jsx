// src/components/sections/product/CheckList.jsx
// Figma "USP lista": grey check + Tenon X-Bold 20/24 line, 8px apart.
// `items` is an ACF repeater of { item }.

import Image from "next/image";
import CheckIcon from "../../../../public/icons/home/check.svg";
import { rows } from "@/lib/content";

export default function CheckList({ items, className = "" }) {
  const list = rows(items).map((r) => r.item || r.text).filter(Boolean);
  if (!list.length) return null;
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {list.map((item, i) => (
        <li key={i} className="flex items-center gap-2 font-extrabold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-(--color-grey-dark)">
          <Image src={CheckIcon} alt="" width={14} height={16} className="shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}
