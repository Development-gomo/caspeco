// src/lib/contentProxy.js
// Pure validation helpers for the /api/content browser proxy (src/app/api/content).
// Kept free of Next.js imports so they can be unit tested with plain node.

import { SUPPORTED_LANGS } from "../config/index.js";

// Exact, anchored allow-list per method. `key` names the query whitelist below.
const ENDPOINTS = {
  GET: [
    { re: /^wp\/v2\/posts$/, key: "posts", cache: "public, s-maxage=60, stale-while-revalidate=300" },
    { re: /^headless\/v1\/cf7-form\/\d{1,9}$/, key: "cf7-form", cache: "public, s-maxage=300, stale-while-revalidate=600" },
  ],
  POST: [
    { re: /^contact-form-7\/v1\/contact-forms\/\d{1,9}\/feedback$/, key: "cf7-post" },
    { re: /^headless\/v1\/cf7-submit\/\d{1,9}$/, key: "cf7-post" },
  ],
};

/** Joins catch-all segments into a lowercased path, or null when any segment is unsafe. */
export function normalizePath(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return null;
  for (const s of segments) {
    if (typeof s !== "string" || s === "" || s === "." || s === ".." || s.includes("\\") || s.includes("/")) return null;
  }
  return segments.join("/").toLowerCase();
}

/** { key, cache } for an allowed method + path, otherwise null. */
export function matchEndpoint(method, path) {
  return ENDPOINTS[method]?.find((e) => e.re.test(path)) || null;
}

const int = (v, min, max) => (/^\d{1,6}$/.test(v) && Number(v) >= min && Number(v) <= max ? v : null);

const POSTS_RULES = {
  lang: (v) => (SUPPORTED_LANGS.includes(v) ? v : null),
  per_page: (v) => int(v, 1, 20),
  page: (v) => int(v, 1, 500),
  orderby: (v) => (v === "date" ? v : null),
  order: (v) => (v === "asc" || v === "desc" ? v : null),
  _embed: (v) => (/^[\w:,]+$/.test(v) ? v : null),
  _fields: (v) => (/^[\w,.]+$/.test(v) ? v : null),
};

const QUERY_RULES = {
  posts: POSTS_RULES,
  "cf7-form": { lang: POSTS_RULES.lang },
  "cf7-post": {},
};

/**
 * Rebuilds the upstream query string from a whitelist. Unknown keys are dropped; a known key with
 * an invalid value is an error. Returns { search } ("" or "?a=b") or { error }.
 */
export function buildQuery(key, searchParams) {
  const rules = QUERY_RULES[key] || {};
  const out = new URLSearchParams();
  for (const name of Object.keys(rules)) {
    const value = searchParams.get(name);
    if (value === null) continue;
    const ok = rules[name](value);
    if (ok === null) return { error: `Invalid "${name}"` };
    out.set(name, ok);
  }
  const s = out.toString();
  return { search: s ? `?${s}` : "" };
}

const hostOf = (url) => {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
};

/** True when Origin (else Referer) is the request host or the site's own host. */
export function isSameOrigin(headers, siteUrl) {
  const source = headers.get("origin") || headers.get("referer");
  const host = source ? hostOf(source) : null;
  if (!host) return false;
  const requestHost = (headers.get("x-forwarded-host") || headers.get("host") || "").split(",")[0].trim().toLowerCase();
  const siteHost = siteUrl ? hostOf(siteUrl) : null;
  return host === requestHost || (siteHost !== null && host === siteHost);
}

/** First client IP from x-forwarded-for, else x-real-ip, else "". */
export function clientIp(headers) {
  const xff = (headers.get("x-forwarded-for") || "").split(",")[0].trim();
  return xff || (headers.get("x-real-ip") || "").trim();
}
