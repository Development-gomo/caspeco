// src/lib/notFoundMessages.js
// Shared 404 copy for every supported language — used by both the
// lang-scoped not-found page and the root fallback not-found page.

export const NOT_FOUND_MESSAGES = {
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
