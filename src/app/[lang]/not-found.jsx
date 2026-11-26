"use client";

// src/app/[lang]/not-found.jsx
// Client component on purpose. A server not-found that read request headers (to learn the language) was rendered
// into the payload of EVERY page of the segment, which made all pages dynamic (no caching) and bloated each page.
// The language comes from the URL (useLang), the header options are fetched from the same-origin proxy, so the
// 404 page itself stays statically cacheable and costs the other pages nothing.

import React from "react";
import Header from "@/components/major/Header";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, langHome } from "@/config";
import { altLangUrls } from "@/lib/translations";
import { NOT_FOUND_MESSAGES } from "@/lib/notFoundMessages";
import { useLang } from "@/lib/useLang";

export default function LangScopedNotFound() {
  const lang = useLang();
  const [options, setOptions] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/content/headless/v1/theme-options?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => !cancelled && data && typeof data === "object" && setOptions(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const currentMessages = NOT_FOUND_MESSAGES[lang] || NOT_FOUND_MESSAGES[DEFAULT_LANG] || NOT_FOUND_MESSAGES.en;

  return (
    <>
      <Header lang={lang} altLangUrls={altLangUrls(lang)} prefetchedOptions={options || {}} logoUrl={options?.logo_light?.url || ""} />
      <div className="h-28 w-full bg-black"></div>
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-(--color-grey-medium-dark)">404</p>
        <h1 className="text-4xl font-semibold">{currentMessages.title}</h1>
        <p className="text-(--color-grey-dark) max-w-xl">{currentMessages.description}</p>
        <CtaButton href={langHome(lang)}>{currentMessages.buttonText}</CtaButton>
      </main>
    </>
  );
}
