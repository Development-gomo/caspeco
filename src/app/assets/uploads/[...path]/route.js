// src/app/assets/uploads/[...path]/route.js
// CMS media under our own domain: /assets/uploads/2026/09/x.png -> WP wp-content/uploads/…
// (lib/wpMask.js rewrites every media URL to this path, so view-source never names the CMS).
// Not an open proxy: only the uploads folder, no "..", only media file types. A host bot-check /
// error page (HTML, even with HTTP 200/202) is never passed on or cached.

const WP_SITE = String(process.env.NEXT_PUBLIC_WP_BASE || "").replace(/\/wp-json\/?$/, "").replace(/\/$/, "");
const MEDIA_EXT = /\.(?:jpe?g|png|gif|webp|avif|svg|ico|mp4|webm|mov|pdf|woff2?|ttf|otf)$/i;
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const FORWARD = ["range", "if-none-match", "if-modified-since", "accept"];
const PASS_BACK = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

const fail = (status) => new Response(status === 404 ? "Not found" : "Unavailable", { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

async function serve(req, { params }, method) {
  const segments = (await params).path || [];
  const path = segments.join("/");
  if (!WP_SITE || !segments.length || segments.some((s) => !s || s === "." || s === ".." || /[\\\0]/.test(s)) || !MEDIA_EXT.test(path)) return fail(404);

  const headers = { "user-agent": BROWSER_UA };
  for (const h of FORWARD) {
    const v = req.headers.get(h);
    if (v) headers[h] = v;
  }

  let res;
  try {
    res = await fetch(`${WP_SITE}/wp-content/uploads/${segments.map(encodeURIComponent).join("/")}`, { method, headers, redirect: "manual", signal: AbortSignal.timeout(15000) });
  } catch {
    return fail(502);
  }

  const type = res.headers.get("content-type") || "";
  if (res.status === 304) return new Response(null, { status: 304, headers: { "cache-control": "public, max-age=31536000, s-maxage=31536000" } });
  if (res.status === 404) return fail(404);
  if (res.status >= 300 || type.includes("html")) return fail(502); // redirect / bot-check / error page

  const out = new Headers();
  for (const h of PASS_BACK) {
    const v = res.headers.get(h);
    if (v) out.set(h, v);
  }
  out.set("cache-control", "public, max-age=31536000, s-maxage=31536000");
  out.set("x-content-type-options", "nosniff");
  return new Response(method === "HEAD" ? null : res.body, { status: res.status, headers: out });
}

export const GET = (req, ctx) => serve(req, ctx, "GET");
export const HEAD = (req, ctx) => serve(req, ctx, "HEAD");
