"use client";

// The root layout sets <html lang> and the <body> page-type class on the server, but
// layouts don't re-render on client navigation — this keeps both in sync with the URL.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SUPPORTED_LANGS, DEFAULT_LANG, PAGE_TYPES, pageTypeFromPath } from "@/config";

export default function LangSyncer() {
  const pathname = usePathname();

  useEffect(() => {
    const firstSegment = pathname.split("/")[1] || "";
    const lang = SUPPORTED_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_LANG;
    document.documentElement.lang = lang;

    // swap only the page-type class, keep any other body classes
    document.body.classList.remove(...PAGE_TYPES);
    document.body.classList.add(pageTypeFromPath(pathname));
  }, [pathname]);

  return null;
}
