// src/app/not-found.jsx

import { DEFAULT_LANG, langFromPath, langHome } from "@/config";
import { headers } from "next/headers";
import CtaButton from "@/components/ui/CtaButton";
import { NOT_FOUND_MESSAGES } from "@/lib/notFoundMessages";

export default async function GlobalNotFound() {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("referer") ?? "";
  const lang = langFromPath(pathname);

  const currentMessages =
    NOT_FOUND_MESSAGES[lang] || NOT_FOUND_MESSAGES[DEFAULT_LANG] || NOT_FOUND_MESSAGES.en;

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white px-4 text-center">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            404
          </p>
          <h1 className="text-4xl font-semibold">{currentMessages.title}</h1>
          <p className="text-gray-600 max-w-lg">{currentMessages.description}</p>
        </div>
        <CtaButton href={langHome(lang)}>{currentMessages.buttonText}</CtaButton>
      </body>
    </html>
  );
}

