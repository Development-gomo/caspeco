// src/app/api/content/[...path]/route.js
// Same-origin proxy for the browser's WordPress REST calls (menus, translations,
// CF7 forms …), so the CMS host never shows up in the network tab. JSON responses
// are masked like server-side fetches (lib/wpMask.js). Only the endpoints the
// frontend uses are forwarded — this is not an open proxy to the whole WP API.

import { NextResponse } from "next/server";
import { maskWp } from "@/lib/wpMask";

const WP_REST = process.env.NEXT_PUBLIC_WP_BASE;

const ALLOW = {
  GET: [/^wp\/v2\/(?!users)/, /^myroutes\/v1\//, /^headless\/v1\//],
  POST: [/^contact-form-7\/v1\/contact-forms\/[\w-]+\/feedback$/, /^headless\/v1\/cf7-submit\/[\w-]+$/],
};

async function proxy(req, { params }) {
  const path = ((await params).path || []).map(encodeURIComponent).join("/");
  if (!ALLOW[req.method].some((re) => re.test(path))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const target = `${WP_REST}/${path}${new URL(req.url).search}`;
  const init = { method: req.method, headers: {} };
  if (req.method === "POST") {
    const type = req.headers.get("content-type");
    if (type) init.headers["content-type"] = type; // keeps the multipart boundary
    init.body = await req.arrayBuffer();
  }

  let res;
  try {
    res = await fetch(target, { ...init, cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
  }

  const type = res.headers.get("content-type") || "";
  if (type.includes("json")) {
    const data = await res.json().catch(() => null);
    // Paging totals for collection requests (NewsListing "Load more")
    const headers = {};
    for (const h of ["x-wp-total", "x-wp-totalpages"]) {
      const v = res.headers.get(h);
      if (v) headers[h] = v;
    }
    return NextResponse.json(maskWp(data), { status: res.status, headers });
  }
  // Non-JSON: pass the body through without WP's headers (Link, X-Powered-By …)
  return new NextResponse(await res.arrayBuffer(), { status: res.status, headers: { "content-type": type || "application/octet-stream" } });
}

export const GET = proxy;
export const POST = proxy;
