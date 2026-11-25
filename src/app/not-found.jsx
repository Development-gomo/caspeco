"use client";

// src/app/not-found.jsx
// Global fallback (a URL no route matches). Client component with no request headers, for the same reason as
// app/[lang]/not-found.jsx: a server not-found that reads headers is rendered into every page and makes them dynamic.

import { DEFAULT_LANG, langHome } from "@/config";
import CtaButton from "@/components/ui/CtaButton";
import { NOT_FOUND_MESSAGES } from "@/lib/notFoundMessages";
import { useLang } from "@/lib/useLang";

export default function GlobalNotFound() {
  const lang = useLang();
  const currentMessages = NOT_FOUND_MESSAGES[lang] || NOT_FOUND_MESSAGES[DEFAULT_LANG] || NOT_FOUND_MESSAGES.en;

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-(--color-grey-medium-dark)">404</p>
          <h1 className="text-4xl font-semibold">{currentMessages.title}</h1>
          <p className="text-(--color-grey-dark) max-w-lg">{currentMessages.description}</p>
        </div>
        <CtaButton href={langHome(lang)}>{currentMessages.buttonText}</CtaButton>
      </body>
    </html>
  );
}
