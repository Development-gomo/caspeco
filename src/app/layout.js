import "./globals.css";
import localFont from "next/font/local";
import { DEFAULT_LANG } from "@/config";
import { headers } from "next/headers";
import LangSyncer from "@/components/LangSyncer";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollToTop from "@/components/ScrollToTop";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

// Cookiebot (Usercentrics) banner. The domain-group ID is read from the environment, so staging / preview / production
// can use different ones; no ID = no banner. Cookiebot's banner language follows the site language.
const COOKIEBOT_ID = process.env.NEXT_PUBLIC_COOKIEBOT_ID || "";
// Google Tag Manager container (GTM-XXXXXXX). Only a well-formed ID is used; no ID = no GTM.
const GTM_ID = /^GTM-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GTM_ID || "") ? process.env.NEXT_PUBLIC_GTM_ID : "";
// Google Consent Mode v2 defaults: everything denied until the visitor chooses in the Cookiebot banner (Cookiebot
// then sends the update through the same dataLayer). Runs before Cookiebot and GTM.
const CONSENT_DEFAULTS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);`;
const gtmSnippet = (id) => `(function(w,d,s,l,i){function go(){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.defer=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}function idle(){('requestIdleCallback' in w)?w.requestIdleCallback(go,{timeout:2000}):setTimeout(go,200);}d.readyState==='complete'?idle():w.addEventListener('load',idle);})(window,document,'script','dataLayer','${id}');`;
const COOKIEBOT_CULTURE = { sv: "sv", en: "en", no: "nb", fr: "fr", frbg: "fr", nl: "nl" };

const tenon = localFont({
  src: [
    { path: "./fonts/tenon-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/tenon-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/tenon-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/tenon-xbold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-tenon",
  fallback: ["system-ui", "sans-serif"],
  display: "swap",
});

export const metadata = {
  // Yoast URLs arrive site-relative (WP host masked), so resolve them against our domain
  ...(process.env.SITE_URL ? { metadataBase: new URL(process.env.SITE_URL) } : {}),
};

export default async function RootLayout({ children }) {
  // Read lang set by middleware (src/middleware.js) so <html lang> is correct
  // for both EN and DA without nesting a second <html> in [lang]/layout.js.
  const h = await headers();
  const lang = h.get("x-lang") || DEFAULT_LANG;
  // Page type from the URL (src/config pageTypeFromPath): home, page, product, industry,
  // casestudy, article, partner, partner-category
  const pageType = h.get("x-page-type") || "page";

  return (
    <html lang={lang} className={tenon.variable} suppressHydrationWarning>
      <head>
        {/* GTM sits at the very top of <head>. Plain inline <script> (not next/script) so it is emitted exactly here, at the
            top of <head>. The consent defaults run at once; the gtm.js download itself is deferred until the page has loaded and the browser is idle (defer has no effect on inline scripts, so it is done in the snippet). Consent Mode v2 defaults (denied) are in the same script, ahead of GTM, so consent is
            known before any tag fires; Cookiebot then updates it. */}
        {GTM_ID && <script id="gtm" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULTS + gtmSnippet(GTM_ID) }} />}
        {COOKIEBOT_ID && (
          <Script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={COOKIEBOT_ID}
            data-blockingmode="auto"
            data-culture={COOKIEBOT_CULTURE[lang] || "en"}
            strategy="beforeInteractive"
          />
        )}

        {/* ── Other tracking scripts go here ── */}
      </head>
      <body className={pageType} suppressHydrationWarning>
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
