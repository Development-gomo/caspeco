// src/app/[lang]/not-found.jsx

import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { DEFAULT_LANG, langFromPath, langHome } from "@/config";
import { headers } from "next/headers";
import CtaButton from "@/components/ui/CtaButton";

export default async function LangScopedNotFound() {
  // next/navigation params are not passed to not-found components;
  // read the request pathname from headers instead.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("referer") ?? "";
  const lang = langFromPath(pathname);

  // Language-specific messages
  const messages = {
    en: {
      title: "The page you're looking for doesn't exist.",
      description:
        "It might have been removed, renamed, or is temporarily unavailable. Please double-check the URL or head back to the homepage.",
      buttonText: "Go to Homepage",
    },
    sv: {
      title: "Sidan du letar efter finns inte.",
      description:
        "Den kan ha tagits bort, bytt namn eller vara tillfälligt otillgänglig. Kontrollera webbadressen eller gå tillbaka till startsidan.",
      buttonText: "Gå till startsidan",
    },
    no: {
      title: "Siden du leter etter finnes ikke.",
      description:
        "Den kan ha blitt fjernet, endret navn eller er midlertidig utilgjengelig. Sjekk nettadressen eller gå tilbake til forsiden.",
      buttonText: "Gå til forsiden",
    },
    da: {
      title: "Siden du leder efter findes ikke.",
      description:
        "Den kan være blevet fjernet, omdøbt eller er midlertidigt utilgængelig. Tjek venligst URL'en eller vend tilbage til forsiden.",
      buttonText: "Gå til forsiden",
    },
    de: {
      title: "Die gesuchte Seite existiert nicht.",
      description:
        "Sie wurde möglicherweise entfernt, umbenannt oder ist vorübergehend nicht verfügbar. Bitte überprüfen Sie die URL oder kehren Sie zur Startseite zurück.",
      buttonText: "Zur Startseite",
    },
    fi: {
      title: "Etsimääsi sivua ei ole olemassa.",
      description:
        "Se on saatettu poistaa, nimetä uudelleen tai se on tilapäisesti pois käytöstä. Tarkista osoite tai palaa etusivulle.",
      buttonText: "Etusivulle",
    },
  };

  const currentMessages = messages[lang] || messages[DEFAULT_LANG] || messages.en;

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
