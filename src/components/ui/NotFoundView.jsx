// src/components/ui/NotFoundView.jsx
// Server-rendered 404 view (header + message + footer) for a missing entry inside a valid language. It is returned by
// the route itself, where the language is known from the URL, so it stays static / cacheable. The real
// not-found.jsx files (client components) only handle URLs no route matches, e.g. an unknown language prefix.
// Same behaviour as before: HTTP 200 with <meta robots noindex> (set by generateMetadata when there is no entry).

import { LangHeader } from "@/components/templates/Shell";
import Footer from "@/components/major/Footer";
import CtaButton from "@/components/ui/CtaButton";
import PageType from "@/components/ui/PageType";
import { getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, langHome } from "@/config";
import { NOT_FOUND_MESSAGES } from "@/lib/notFoundMessages";

export default async function NotFoundView({ lang = DEFAULT_LANG, themeOptions }) {
  const options = themeOptions ?? (await getThemeOptions(lang));
  const messages = NOT_FOUND_MESSAGES[lang] || NOT_FOUND_MESSAGES[DEFAULT_LANG] || NOT_FOUND_MESSAGES.en;
  return (
    <PageType type="page">
      <LangHeader lang={lang} themeOptions={options} />
      <div className="h-28 w-full bg-black"></div>
      <main className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-(--color-grey-medium-dark)">404</p>
        <h1 className="text-4xl font-semibold">{messages.title}</h1>
        <p className="text-(--color-grey-dark) max-w-xl">{messages.description}</p>
        <CtaButton href={langHome(lang)}>{messages.buttonText}</CtaButton>
      </main>
      <Footer lang={lang} />
    </PageType>
  );
}
