"use client";

// src/app/error.jsx
// Global error boundary — catches runtime errors in the app shell.
// Must be a Client Component (Next.js requirement).

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG } from "@/config";
import { postStrings } from "@/lib/postStrings";
import { useLang } from "@/lib/useLang";

export default function GlobalError({ error, reset }) {
  const lang = useLang();
  const t = postStrings(lang);
  useEffect(() => {
    // Log to your error reporting service here when ready (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-(--color-grey-medium-dark)">{t.errorLabel}</p>
        <h1 className="text-4xl font-semibold">{t.errorTitle}</h1>
        <p className="text-(--color-grey-dark) max-w-lg">
          {t.errorBody}
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-sm border border-(--color-grey-medium) px-6 py-4 text-[16px] transition-all duration-300 hover:bg-(--color-light-grey)"
        >
          {t.tryAgain}
        </button>
        <CtaButton href={lang === DEFAULT_LANG ? "/" : `/${lang}`}>{t.goHome}</CtaButton>
      </div>
    </div>
  );
}
