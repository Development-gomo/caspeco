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
        {/* Cookiebot loads first (beforeInteractive) so consent is known before any tracking script runs */}
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

        {/* ── Google Tag Manager ── add GTM-XXXXXX and uncomment when live 
        <Script
          id="gtm"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-"
          strategy="afterInteractive"
        />*/}

        {/* ── Other tracking scripts go here ── */}
      </head>
      <body className={pageType} suppressHydrationWarning>
        {/* ── GTM noscript fallback ── uncomment when live */}
        {/* <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-" height="0" width="0" style={{ display: "none", visibility: "hidden" }}
          />
        </noscript> */}

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
