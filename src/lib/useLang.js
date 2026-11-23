"use client";

// Language of the current page for client components that have no `lang` prop: the first path segment when it is a
// supported language, otherwise the default language (served without a prefix).
import { usePathname } from "next/navigation";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";

export function useLang() {
  const first = (usePathname() || "").split("/")[1];
  return SUPPORTED_LANGS.includes(first) ? first : DEFAULT_LANG;
}
