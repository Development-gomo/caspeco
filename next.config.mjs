/** @type {import('next').NextConfig} */
import { SUPPORTED_LANGS, DEFAULT_LANG } from "./src/config/index.js";

const wpHostname = new URL(process.env.NEXT_PUBLIC_WP_BASE).hostname;
// WP site URL without /wp-json — media is served from it under /assets (see src/lib/wpMask.js)
const wpSite = process.env.NEXT_PUBLIC_WP_BASE.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
const nonDefaultLangs = SUPPORTED_LANGS.filter((l) => l !== DEFAULT_LANG);

const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: wpHostname, pathname: "/**" },
      { protocol: "https", hostname: `www.${wpHostname}`, pathname: "/**" },
    ],
  },

  async headers() {
    const siteUrl = process.env.SITE_URL;
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
            value: `<${siteUrl}/sitemap.xml>; rel="sitemap", <${siteUrl}/robots.txt>; rel="robots"`,
          },
        ],
      },
    ];
  },

  async redirects() {
    return SUPPORTED_LANGS.map((lang) => ({
      source: lang === DEFAULT_LANG ? "/frontpage" : `/${lang}/frontpage`,
      destination: lang === DEFAULT_LANG ? "/" : `/${lang}`,
      permanent: true,
    }));
  },

  async rewrites() {
    return [
      // CMS media/files under our own domain: /assets/uploads/… → WP wp-content (proxied, host hidden)
      { source: "/assets/:path*", destination: `${wpSite}/wp-content/:path*` },
      { source: "/static/:path*", destination: `${wpSite}/wp-includes/:path*` },
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
