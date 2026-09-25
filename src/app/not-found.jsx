// src/app/not-found.jsx

import { DEFAULT_LANG } from "@/config";
import CtaButton from "@/components/ui/CtaButton";

export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LANG}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            404
          </p>
          <h1 className="text-4xl font-semibold">Page not found</h1>
          <p className="text-gray-600 max-w-lg">
            We couldn&apos;t find the page you were looking for. Try starting
            from the English homepage.
          </p>
        </div>
        <CtaButton href="/">Go to Home</CtaButton>
      </body>
    </html>
  );
}

