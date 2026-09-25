// src/components/major/MoreLocationsToggle.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import DownSvg from "../../../public/down-arrow.svg";

export default function MoreLocationsToggle({ label, html }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[16px] font-medium text-(--color-white) underline underline-offset-2 hover:text-(--color-grey-medium) transition"
      >
        {label}
        <span className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <Image src={DownSvg} alt="" width={10} height={10} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div
          className="overflow-hidden text-[16px] text-(--color-grey-medium) [&_a]:underline [&_a]:underline-offset-2 [&_a]:text-(--color-white) [&_a:hover]:text-(--color-grey-medium) [&_p]:m-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
