// src/app/[lang]/not-found.jsx

import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { DEFAULT_LANG, langFromPath, langHome } from "@/config";
import { headers } from "next/headers";
import CtaButton from "@/components/ui/CtaButton";
import { NOT_FOUND_MESSAGES } from "@/lib/notFoundMessages";

export default async function LangScopedNotFound() {
  // next/navigation params are not passed to not-found components;
  // read the request pathname from headers instead.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("referer") ?? "";
  const lang = langFromPath(pathname);

  const currentMessages =
    NOT_FOUND_MESSAGES[lang] || NOT_FOUND_MESSAGES[DEFAULT_LANG] || NOT_FOUND_MESSAGES.en;

  return (
    <>
      <Header lang={lang} />
      <div className="h-28 w-full bg-black"></div>
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">404</p>
        <h1 className="text-4xl font-semibold">{currentMessages.title}</h1>
        <p className="text-gray-600 max-w-xl">{currentMessages.description}</p>
        <CtaButton href={langHome(lang)}>{currentMessages.buttonText}</CtaButton>
      </main>
      <Footer lang={lang} />
    </>
  );
}
