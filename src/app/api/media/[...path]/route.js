// src/app/api/media/[...path]/route.js
// Same-origin proxy for CMS media, so image/video URLs never show the WordPress host.
// Reached through the rewrites in next.config.mjs:
//   /assets/…  → /api/media/wp-content/…
//   /static/…  → /api/media/wp-includes/…
//
// Why a route handler instead of a plain external rewrite: SiteGround's anti-bot answers
// some server-side requests (Vercel runs on AWS IPs) with a CAPTCHA page (202 text/html,
// "sg-captcha: challenge") instead of the file. A rewrite passes that HTML to the <img>
// and the image breaks. Here every upstream answer is checked first:
//   - real media        → streamed back, cached on Vercel's CDN so SiteGround sees each file ~once
//   - challenge / error → 307 to the file on the CMS host, so the browser (never challenged)
//                         loads it directly. The image always shows; only that request reveals the host.
// Only media file types under wp-content/uploads (+ a few core/theme asset folders) are
// forwarded, so this is not an open proxy to the WP install.

import { WP_SITE } from "@/lib/wpMask";

// Optional: a different origin that serves the same wp-content tree (e.g. a CDN pull zone or an
// allowlisted hostname). Defaults to the WP site itself.
const ORIGIN = (process.env.WP_MEDIA_ORIGIN || WP_SITE).replace(/\/$/, "");

const ALLOWED_PATH = /^(?:wp-content\/(?:uploads|themes|plugins)|wp-includes\/(?:images|js\/mediaelement))\//;
const ALLOWED_EXT =
  /\.(?:avif|webp|png|jpe?g|gif|svg|ico|bmp|tiff?|mp4|webm|ogv|mov|m4v|mp3|m4a|ogg|oga|wav|pdf|woff2?|ttf|otf|eot|vtt|json|lottie)$/i;

// Request headers worth forwarding (range = video seeking, conditionals = cheap 304s)
const FORWARD_REQ = ["range", "if-none-match", "if-modified-since", "accept"];
// Response headers worth keeping (no Server / X-Powered-By / Link that name the CMS)
const FORWARD_RES = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

// Successful files: browsers 1 day, Vercel CDN 30 days (WP keeps file names stable;
// replaced media can be purged from the Vercel dashboard or by redeploying)
const CACHE_OK = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400";
// Fallback redirect: cached briefly so a challenged file doesn't hit SiteGround on every view,
// but short enough that masking resumes soon after the challenge stops.
const CACHE_FALLBACK = "public, max-age=300, s-maxage=300";

function isChallenge(res) {
  if (res.headers.get("sg-captcha")) return true;
  if (res.status === 202) return true; // SiteGround's challenge status
  // Allowed extensions are never HTML; an HTML answer is a block/challenge/error page
  return (res.headers.get("content-type") || "").includes("text/html");
}

async function handle(req, { params }) {
  const segments = (await params).path || [];
  const path = segments.map(encodeURIComponent).join("/");
  if (!ORIGIN || segments.some((s) => s === ".." || s === ".") || !ALLOWED_PATH.test(path) || !ALLOWED_EXT.test(path)) {
    return new Response("Not found", { status: 404 });
  }

  const target = `${ORIGIN}/${path}${new URL(req.url).search}`;
  const direct = `${WP_SITE}/${path}${new URL(req.url).search}`;
  const fallback = (reason) => {
    console.warn(`[media] ${reason} for /${path} — redirecting browser to CMS host`);
    return new Response(null, { status: 307, headers: { location: direct, "cache-control": CACHE_FALLBACK } });
  };

  const headers = {};
  for (const h of FORWARD_REQ) {
    const v = req.headers.get(h);
    if (v) headers[h] = v;
  }

  let res;
  try {
    res = await fetch(target, { method: req.method, headers, cache: "no-store", redirect: "follow" });
  } catch {
    return fallback("upstream unreachable");
  }

  if (res.status === 404) return new Response("Not found", { status: 404 });
  if (isChallenge(res)) return fallback(`upstream challenge (status ${res.status}, sg-captcha: ${res.headers.get("sg-captcha") || "-"})`);
  if (res.status !== 200 && res.status !== 206 && res.status !== 304) return fallback(`upstream status ${res.status}`);

  const out = new Headers({ "cache-control": CACHE_OK, "x-content-type-options": "nosniff" });
  // fetch() already decoded any content-encoding, so the upstream length no longer applies
  const decoded = !!res.headers.get("content-encoding");
  for (const h of FORWARD_RES) {
    const v = res.headers.get(h);
    if (v && !(decoded && h === "content-length")) out.set(h, v);
  }
  // SVG can carry scripts; served from our origin it must not run
  if ((out.get("content-type") || "").includes("svg")) out.set("content-security-policy", "script-src 'none'; sandbox");

  return new Response(req.method === "HEAD" || res.status === 304 ? null : res.body, { status: res.status, headers: out });
}

export const GET = handle;
export const HEAD = handle;
