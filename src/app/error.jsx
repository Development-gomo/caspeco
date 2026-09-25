"use client";

// src/app/error.jsx
// Global error boundary — catches runtime errors in the app shell.
// Must be a Client Component (Next.js requirement).

import { useEffect } from "react";
import CtaButton from "@/components/ui/CtaButton";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log to your error reporting service here when ready (e.g. Sentry)
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Error</p>
        <h1 className="text-4xl font-semibold">Something went wrong</h1>
        <p className="text-gray-600 max-w-lg">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-sm border border-gray-300 px-6 py-4 text-[16px] transition-all duration-300 hover:bg-gray-50"
        >
          Try again
        </button>
        <CtaButton href="/">Go to Homepage</CtaButton>
      </div>
    </div>
  );
}
