import "./globals.css";
import localFont from "next/font/local";
import { DEFAULT_LANG } from "@/config";
import { headers } from "next/headers";
import LangSyncer from "@/components/LangSyncer";
import ScrollProgress from "@/components/ScrollProgress";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
//import Script from "next/script"; // uncomment when adding tracking scripts

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
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }) {
  // Read lang set by middleware (src/middleware.js) so <html lang> is correct
  // for both EN and DA without nesting a second <html> in [lang]/layout.js.
  const h = await headers();
  const lang = h.get("x-lang") || DEFAULT_LANG;

  return (
    <html lang={lang} className={tenon.variable} suppressHydrationWarning>
      <head>
        {/* ── Cookiebot ── add data-cbid and uncomment when live
        <Script
          id="cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="YOUR-COOKIEBOT-ID"
          data-blockingmode="auto"
          strategy="beforeInteractive"
        />
        */}

        {/* ── Google Tag Manager ── add GTM-XXXXXX and uncomment when live 
        <Script
          id="gtm"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-MNT94DBK"
          strategy="afterInteractive"
        />*/}
      

        {/* ── Other tracking scripts go here ── */}
      </head>
      <body suppressHydrationWarning>
        {/* ── GTM noscript fallback ── uncomment when live */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MNT94DBK" height="0" width="0" style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        

        <LangSyncer />
        <ScrollProgress />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
