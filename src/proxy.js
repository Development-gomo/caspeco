// src/proxy.js
// 1. Sets x-lang / x-page-type headers so the root layout can set <html lang> and the <body> class.
// 2. Fetches redirects from /api/wp-redirects and applies them.

import { NextResponse } from "next/server";
import { SUPPORTED_LANGS, DEFAULT_LANG, pageTypeFromPath } from "@/config";

// ─── In-memory redirect cache ────────────────────────────────────────────────
// The proxy runs on every request (incl. RSC navigations and prefetches), so the lookup
// must almost always be a memory hit. Any valid result is cached — an empty list too —
// so a site with no rules (or missing WP credentials → []) doesn't refetch per request.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const ERROR_TTL_MS = 60 * 1000; // endpoint failing/slow: back off for 1 minute
const FETCH_TIMEOUT_MS = 800; // never hold a page request longer than this for redirects
let _redirectsCache = null;
let _cacheExpiry = 0;
let _inflight = null; // shared pending fetch, so a burst on a cold instance triggers one call

async function fetchRedirects(origin) {
  try {
    const res = await fetch(`${origin}/api/wp-redirects`, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        _redirectsCache = data;
        _cacheExpiry = Date.now() + CACHE_TTL_MS;
        return _redirectsCache;
      }
    }
  } catch {}

  // Timeout / error / bad payload: fail open (last good list, else no redirects)
  // and cache that briefly so a failing endpoint isn't hit on every request.
  _redirectsCache = _redirectsCache ?? [];
  _cacheExpiry = Date.now() + ERROR_TTL_MS;
  return _redirectsCache;
}

async function getRedirects(origin) {
  if (_redirectsCache !== null && Date.now() < _cacheExpiry) {
    return _redirectsCache;
  }
  if (!_inflight) {
    _inflight = fetchRedirects(origin).finally(() => {
      _inflight = null;
    });
  }
  return _inflight;
}

// ─── Match pathname against redirect list ─────────────────────────────────────
function matchRedirect(redirects, pathname) {
  for (const r of redirects) {
    const source = r.url;
    const destination = r.action_data?.url;
    const code = r.action_code || 301;
    const matchType = r.match_type || "url";

    if (!source || !destination) continue;

    const ignoreTrailing = r.match_data?.source?.flag_trailing ?? false;
    const norm = (p) => (ignoreTrailing ? p.replace(/\/$/, "") : p);

    if (matchType === "url") {
      if (norm(pathname) === norm(source)) return { destination, code };
    } else if (matchType === "url-nocase") {
      if (norm(pathname).toLowerCase() === norm(source).toLowerCase())
        return { destination, code };
    } else if (matchType === "regex") {
      try {
        const re = new RegExp(source, "i");
        const match = pathname.match(re);
        if (match) {
          const resolved = destination.replace(/\$(\d+)/g, (_, n) => match[n] ?? "");
          return { destination: resolved, code };
        }
      } catch {}
    }
  }
  return null;
}

// ─── Proxy ───────────────────────────────────────────────────────────────────
export async function proxy(request){
  const { pathname, origin } = request.nextUrl;

  // Serve custom robots.txt with Content-Signal directives.
  // Middleware intercepts before the static robots.js metadata route runs.
  if (pathname === "/robots.txt") {
    const siteUrl = process.env.SITE_URL;
    const body = [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      `Sitemap: ${siteUrl}/sitemap.xml`,
      "",
      "# AI content usage preferences (contentsignals.org)",
      "Content-Signal: ai-train=no, search=yes, ai-input=no",
    ].join("\n");
    return new Response(body, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 1. Check WordPress redirects
  const redirects = await getRedirects(origin);
  const hit = matchRedirect(redirects, pathname);

  if (hit) {
    const dest = hit.destination.startsWith("http")
      ? new URL(hit.destination)
      : new URL(hit.destination, origin);
    return NextResponse.redirect(dest, { status: hit.code });
  }

  // 2. Pass through — x-lang, x-pathname and x-page-type for layouts / not-found pages.
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
  matcher: ["/((?!_next|api|assets|static|favicon\\.ico).*)"],
};
