// src/app/api/content/[...path]/route.js
// Same-origin proxy for the browser's WordPress REST calls, so the CMS host never shows up in
// the network tab. This is NOT an open proxy: only the four endpoints the browser uses are
// forwarded (GET wp/v2/posts, GET headless/v1/cf7-form/{id}, POST CF7 feedback / cf7-submit),
// with a rebuilt, validated query string. Rules live in lib/contentProxy.js.
// JSON responses are masked like server-side fetches (lib/wpMask.js).

import { NextResponse } from "next/server";
import { maskWp } from "@/lib/wpMask";
import { normalizePath, matchEndpoint, buildQuery, isSameOrigin, clientIp } from "@/lib/contentProxy";

const WP_REST = process.env.NEXT_PUBLIC_WP_BASE;
const NO_STORE = { "cache-control": "no-store" };

const fail = (error, status) => NextResponse.json({ error }, { status, headers: NO_STORE });

async function proxy(req, { params }) {
  const path = normalizePath((await params).path);
  const endpoint = path && matchEndpoint(req.method, path); // HEAD etc. have no entry → 404
  if (!endpoint) return fail("Not found", 404);

  const isPost = req.method === "POST";
  if (isPost && !isSameOrigin(req.headers, process.env.SITE_URL)) return fail("Forbidden", 403);

  const query = buildQuery(endpoint.key, new URL(req.url).searchParams);
  if (query.error) return fail(query.error, 400);

  const headers = {};
  const init = { method: req.method, headers, cache: "no-store", signal: AbortSignal.timeout(isPost ? 15000 : 8000) };
  if (isPost) {
    const type = req.headers.get("content-type");
    if (type) headers["content-type"] = type; // keeps the multipart boundary
    const ua = req.headers.get("user-agent");
    if (ua) headers["user-agent"] = ua;
    const ip = clientIp(req.headers);
    if (ip) headers["x-forwarded-for"] = ip;
    init.body = await req.arrayBuffer();
  }

  let res;
  try {
    res = await fetch(`${WP_REST}/${path}${query.search}`, init);
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") return fail("Upstream timeout", 504);
    return fail("Upstream unavailable", 502);
  }

  // A host bot-check / error page (HTML, even with HTTP 200/202) is never passed on
  if (!(res.headers.get("content-type") || "").includes("json")) return fail("Upstream unavailable", 502);

  const data = await res.json().catch(() => null);
  const out = { ...NO_STORE };
  // Paging totals for collection requests (NewsListing "Load more")
  for (const h of ["x-wp-total", "x-wp-totalpages"]) {
    const v = res.headers.get(h);
    if (v) out[h] = v;
  }
  if (!isPost && res.status === 200 && endpoint.cache) out["cache-control"] = endpoint.cache;
  return NextResponse.json(maskWp(data), { status: res.status, headers: out });
}

export const GET = proxy;
export const POST = proxy;
