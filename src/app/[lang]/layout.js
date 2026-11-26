import "../globals.css";
import localFont from "next/font/local";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/config";
import LangSyncer from "@/components/LangSyncer";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollToTop from "@/components/ScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// Cookiebot (Usercentrics) banner. The domain-group ID is read from the environment, so staging / preview / production
// can use different ones; no ID = no banner. Cookiebot's banner language follows the site language.
const COOKIEBOT_ID = process.env.NEXT_PUBLIC_COOKIEBOT_ID || "";
// Google Tag Manager container (GTM-XXXXXXX). Only a well-formed ID is used; no ID = no GTM.
const GTM_ID = /^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM_ID || "") ? process.env.NEXT_PUBLIC_GTM_ID : "";
// Google Consent Mode v2 defaults: everything denied until the visitor chooses in the Cookiebot banner (Cookiebot
// then sends the update through the same dataLayer). Runs before Cookiebot and GTM.
const CONSENT_DEFAULTS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);`;
const deferredLoader = (gtmId, cbId, culture) => `(function(w,d){function add(src,attrs){var s=d.createElement('script');s.async=true;s.defer=true;s.src=src;for(var k in attrs)s.setAttribute(k,attrs[k]);d.head.appendChild(s);}function go(){var cb='${cbId}',g='${gtmId}';if(cb)add('https://consent.cookiebot.com/uc.js',{id:'Cookiebot','data-cbid':cb,'data-blockingmode':'auto','data-culture':'${culture}'});if(g){w.dataLayer=w.dataLayer||[];w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});add('https://www.googletagmanager.com/gtm.js?id='+g);}}function idle(){('requestIdleCallback' in w)?w.requestIdleCallback(go,{timeout:2000}):setTimeout(go,200);}d.readyState==='complete'?idle():w.addEventListener('load',idle);})(window,document);`;
const COOKIEBOT_CULTURE = { sv: "sv", en: "en", no: "nb", fr: "fr", frbg: "fr", nl: "nl" };

const tenon = localFont({
  src: [
    { path: "../fonts/tenon-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/tenon-medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/tenon-bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/tenon-xbold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-tenon",
  fallback: ["system-ui", "sans-serif"],
  display: "swap",
});

export const metadata = {
  // Yoast URLs arrive site-relative (WP host masked), so resolve them against our domain
  ...(process.env.SITE_URL ? { metadataBase: new URL(process.env.SITE_URL) } : {}),
};

// Root layout (this is the only layout with <html>/<body>; there is no app/layout.js). The language comes from the
// route segment, not from request headers, so the pages can be statically generated and cached (ISR). The <body>
// page-type class (home, partner …) is applied by each page on a wrapper, see components/ui/PageType.jsx.
export default async function RootLayout({ children, params }) {
  const { lang: routeLang } = await params;
  const lang = SUPPORTED_LANGS.includes(routeLang) ? routeLang : DEFAULT_LANG;

  return (
    <html lang={lang} className={tenon.variable} suppressHydrationWarning>
      <head>
        {/* Consent Mode v2 defaults (everything denied) run at once, at the top of <head>, as a plain inline script. Cookiebot and
            GTM are then downloaded after the page has loaded and the browser is idle (Cookiebot first, then GTM), so neither
            competes with the first render. defer has no effect on inline scripts, so the deferral is done in the loader. */}
        {(GTM_ID || COOKIEBOT_ID) && (
          <script
            id="consent-loader"
            dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS + deferredLoader(GTM_ID, COOKIEBOT_ID, COOKIEBOT_CULTURE[lang] || "en") }}
          />
        )}

        {/* ── Other tracking scripts go here ── */}
      </head>
      <body suppressHydrationWarning>
        {GTM_ID && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager" />
          </noscript>
        )}

        <LangSyncer />
        <ScrollProgress />
        {children}
        <ScrollToTop />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
