// src/proxy.js
// 1. Sets x-lang / x-page-type headers so the root layout can set <html lang> and the <body> class.
// 2. Fetches redirects straight from the WP Redirection API (lib/redirects.js) and applies them.

import { NextResponse } from "next/server";
import { SUPPORTED_LANGS, DEFAULT_LANG, pageTypeFromPath, siteUrl } from "@/config";
import { fetchRules, normalizeRules, matchRedirect } from "@/lib/redirects";

// ─── In-memory redirect cache ────────────────────────────────────────────────
// Single-flight, stale-while-revalidate. Success: fresh 5 min. Failure: keep the last good list and
// don't retry for 60 s. An empty list is a valid cached answer.
let rules = null;
let freshUntil = 0;
let inflight = null;

function refresh() {
  inflight ??= fetchRules()
    .then((list) => {
      rules = normalizeRules(list);
      freshUntil = Date.now() + 300_000;
    })
    .catch((e) => {
      freshUntil = Date.now() + 60_000;
      console.warn("[redirects]", e?.message);
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

async function getRedirects(event) {
  if (Date.now() < freshUntil) return rules ?? [];
  const p = refresh();
  event?.waitUntil?.(p);
  if (rules) return rules; // stale while revalidating
  await p; // cold start waits once (bounded by the fetch timeout)
  return rules ?? [];
}

// Lower-case a path but leave %XX escapes untouched (%C3%A5 must not become %c3%a5).
// A path with a malformed escape (e.g. "%E0%A4%A") is returned as is: it can't be decoded, so it is
// left to the not-found / error handling instead of being redirected.
const lowerPath = (p) => {
  try {
    decodeURIComponent(p);
  } catch {
    return p;
  }
  return p.replace(/%[0-9A-Fa-f]{2}|[^%]+/g, (m) => (m[0] === "%" ? m : m.toLowerCase()));
};

// ─── Proxy ───────────────────────────────────────────────────────────────────
export async function proxy(request, event) {
  const { pathname, search, origin } = request.nextUrl;

  // Serve custom robots.txt with Content-Signal directives.
  // This proxy is the only source of /robots.txt (there is no app/robots.js).
  if (pathname === "/robots.txt") {
    const body = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      `Sitemap: ${siteUrl()}/sitemap.xml`,
      "",
      "# AI content usage preferences (contentsignals.org)",
      "Content-Signal: ai-train=no, search=yes, ai-input=no",
    ].join("\n");
    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 1. Check WordPress redirects
  const redirects = await getRedirects(event);
  const hit = matchRedirect(redirects, pathname, search);

  if (hit) {
    return NextResponse.redirect(new URL(hit.location, origin), { status: hit.status });
  }

  // 2. Upper-case letters in the path -> 301 to the lower-case URL. %XX escapes keep their case
  // (only the literal runs between them are changed); the query string is kept as is.
  const lower = lowerPath(pathname);
  if (lower !== pathname) return NextResponse.redirect(new URL(lower + search, origin), 301);

  // 3. Pass through — x-lang, x-pathname and x-page-type for layouts / not-found pages.
  // Set on the forwarded request (what headers() reads in the layout) and on the response.
  const firstSegment = pathname.split("/")[1] || "";
  const lang = SUPPORTED_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_LANG;
  const extra = { "x-lang": lang, "x-pathname": pathname, "x-page-type": pageTypeFromPath(pathname) };

  const requestHeaders = new Headers(request.headers);
  Object.entries(extra).forEach(([k, v]) => requestHeaders.set(k, v));
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  Object.entries(extra).forEach(([k, v]) => response.headers.set(k, v));
  return response;
}

export const config = {
  matcher: [
    "/robots.txt",
    "/((?!(?:_next|api|assets|static)(?:/|$)|favicon\\.ico$|.*\\.[A-Za-z0-9]{1,8}$).*)",
  ],
};
