/** @type {import('next').NextConfig} */
import { SUPPORTED_LANGS, DEFAULT_LANG, legacyBaseRedirects, siteUrl } from "./src/config/index.js";

const wpHostname = new URL(process.env.NEXT_PUBLIC_WP_BASE).hostname;
// WP site URL without /wp-json — media is served from it under /assets (see src/lib/wpMask.js)
const wpSite = process.env.NEXT_PUBLIC_WP_BASE.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
if (process.env.VERCEL_ENV === "production" && !process.env.SITE_URL) {
  console.warn("[config] SITE_URL is not set on a production build: falling back to VERCEL_PROJECT_PRODUCTION_URL for the sitemap, robots.txt and Link header. Set SITE_URL to the public origin.");
}
const nonDefaultLangs = SUPPORTED_LANGS.filter((l) => l !== DEFAULT_LANG);

const nextConfig = {
  reactStrictMode: true,

  // Inline the (~34 KB) global CSS into the HTML: the stylesheet request was render-blocking (~800 ms on throttled
  // mobile) before first paint. Fonts already use next/font (display: swap, preloaded).
  experimental: { inlineCss: true },

  images: {
    // Vercel Image Optimization (AVIF/WebP + right-sized files): the account is on Pro now. It was switched off
    // when the Hobby quota returned 402 and broke every image; unoptimized: true is the emergency switch.
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // optimized files are cached for 31 days (media URLs carry the upload date)
    // fewer srcset candidates per image (10 instead of 16): each next/image repeats its srcset in the HTML and in the
    // hydration data, ~185 KB of the page with the default list
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: wpHostname, pathname: "/**" },
      { protocol: "https", hostname: `www.${wpHostname}`, pathname: "/**" },
    ],
  },

  async headers() {
    const site = siteUrl();
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: `<${site}/sitemap.xml>; rel="sitemap", <${site}/robots.txt>; rel="robots"`,
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // the default language has no prefix: /sv/... is a duplicate of /...
      { source: `/${DEFAULT_LANG}`, destination: "/", statusCode: 301 },
      { source: `/${DEFAULT_LANG}/:path*`, destination: "/:path*", statusCode: 301 },
      ...SUPPORTED_LANGS.map((lang) => ({
        source: lang === DEFAULT_LANG ? "/frontpage" : `/${lang}/frontpage`,
        destination: lang === DEFAULT_LANG ? "/" : `/${lang}`,
        permanent: true,
      })),
      // old content-type URL bases (e.g. /en/icp/x → /en/solutions/x), see ROUTE_TYPES.legacyBase
      ...legacyBaseRedirects(),
    ];
  },

  async rewrites() {
    return [
      // CMS media under our own domain: /assets/uploads/... is a route handler (src/app/assets/uploads)
      // that fetches wp-content/uploads from the CMS, so the host stays hidden. Pass-through keeps the
      // default-language catch-all below from grabbing it.
      { source: "/assets/uploads/:path*", destination: "/assets/uploads/:path*" },
      // Everything else under /assets and /static (plugins, themes, wp-includes) is a plain 404 (/api/gone).
      { source: "/assets/:path*", destination: "/api/gone" },
      { source: "/static/:path*", destination: "/api/gone" },
      // API routes (incl. dynamic /api/content/…) must not fall into the default-language rewrite
      { source: "/api/:path*", destination: "/api/:path*" },
      // Pass-throughs for each non-default language (prevents catch-all rewrite below from grabbing them)
      ...nonDefaultLangs.flatMap((lang) => [
        { source: `/${lang}`, destination: `/${lang}` },
        { source: `/${lang}/:path*`, destination: `/${lang}/:path*` },
      ]),
      // Default language: rewrite everything else to /en/...
      { source: "/", destination: `/${DEFAULT_LANG}` },
      { source: "/:path*", destination: `/${DEFAULT_LANG}/:path*` },
    ];
  },
};

export default nextConfig;
