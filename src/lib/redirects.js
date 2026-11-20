// src/lib/redirects.js
// WordPress "Redirection" plugin rules → proxy.js redirects.
// Relative imports only (with extensions) so a plain node script can import this file.
//
// Redirection semantics handled here:
//   match_type "url" + action_type "url" only (everything else is skipped)
//   flag_case true     → ignore case
//   flag_trailing true → ignore a trailing slash
//   flag_query exact   → a source without ?query matches and passes the incoming query through (lenient);
//                        a source WITH ?query needs the same params, in any order
//   flag_query ignore  → match the path, drop the incoming query
//   flag_query pass    → match the path, append the incoming query to the destination
//   regex (flag_regex / r.regex) → RegExp on the decoded pathname, $1..$99 in the destination

import { WP_BASE, sitePath } from "../config/index.js";
import { maskWpString } from "./wpMask.js";

const PER_PAGE = 200;
const MAX_PAGES = 10;
const TIMEOUT_MS = 3000;
const CODES = [301, 302, 303, 307, 308];

// ─── Fetch ───────────────────────────────────────────────────────────────────
/** All rules from the Redirection API. Throws on ANY failure (never returns a partial list). */
export async function fetchRules() {
  const user = process.env.WP_API_USER;
  const pass = process.env.WP_API_PASS;
  if (!WP_BASE || !user || !pass) throw new Error("missing WP base URL or credentials");
  const auth = `Basic ${btoa(`${user}:${pass}`)}`;

  const all = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(`${WP_BASE}/redirection/v1/redirect?per_page=${PER_PAGE}&page=${page}`, {
      cache: "no-store",
      headers: { Authorization: auth },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status !== 200) throw new Error(`Redirection API HTTP ${res.status}`);
    if (!(res.headers.get("content-type") || "").includes("json")) throw new Error("Redirection API returned non-JSON");
    const body = await res.json();
    if (!Array.isArray(body?.items)) throw new Error("Redirection API: no items array");
    all.push(...body.items);
    if (all.length >= body.total || body.items.length < PER_PAGE) return all;
  }
  throw new Error("Redirection API: too many pages");
}

// ─── Normalise ───────────────────────────────────────────────────────────────
/** Raw API items → only what matchRedirect needs. */
export function normalizeRules(items) {
  if (!Array.isArray(items)) return [];
  const rules = [];
  for (const r of items) {
    if (!r || r.enabled === false) continue;
    if (r.match_type && r.match_type !== "url") continue;
    if (r.action_type && r.action_type !== "url") continue;
    const f = r.match_data?.source || {};
    const dest = r.action_data?.url;
    if (typeof r.url !== "string" || !r.url || typeof dest !== "string" || !dest.trim()) continue;
    rules.push({
      source: r.url,
      regex: r.regex === true || f.flag_regex === true,
      ignoreCase: f.flag_case === true,
      ignoreTrailing: f.flag_trailing === true,
      query: ["ignore", "pass"].includes(f.flag_query) ? f.flag_query : "exact",
      destination: maskWpString(dest.trim()),
      code: CODES.includes(Number(r.action_code)) ? Number(r.action_code) : 301,
    });
  }
  return rules;
}

// ─── Match ───────────────────────────────────────────────────────────────────
const safeDecode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

function normPath(p, rule) {
  if (rule.ignoreTrailing && p.length > 1) p = p.replace(/\/+$/, "") || "/";
  return rule.ignoreCase ? p.toLowerCase() : p;
}

const paramKey = (params) =>
  [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join("&");

/** Validate a destination; returns the safe string or null (drop the rule). */
function safeDest(dest) {
  let d = String(dest).trim();
  if (!d || /[\u0000-\u001f\u007f]/.test(d)) return null;
  if (/^https?:\/\//i.test(d)) {
    try {
      return new URL(d).href;
    } catch {
      return null;
    }
  }
  if (d.startsWith("//") || d.includes("\\") || /^[a-z][a-z0-9+.-]*:/i.test(d)) return null;
  if (!d.startsWith("/")) d = "/" + d;
  return sitePath(d);
}

/** Append `params` (not overriding the destination's own keys) to a destination string. */
function withQuery(dest, params) {
  if (![...params.keys()].length) return dest;
  const hashAt = dest.indexOf("#");
  const hash = hashAt >= 0 ? dest.slice(hashAt) : "";
  const noHash = hashAt >= 0 ? dest.slice(0, hashAt) : dest;
  const qAt = noHash.indexOf("?");
  const base = qAt >= 0 ? noHash.slice(0, qAt) : noHash;
  const own = new URLSearchParams(qAt >= 0 ? noHash.slice(qAt + 1) : "");
  for (const [k, v] of params) if (!own.has(k)) own.append(k, v);
  const qs = own.toString();
  return base + (qs ? `?${qs}` : "") + hash;
}

const reCache = new WeakMap();
function regexFor(rule) {
  if (!reCache.has(rule)) {
    let re = null;
    try {
      re = new RegExp(rule.source, rule.ignoreCase ? "i" : "");
    } catch {}
    reCache.set(rule, re);
  }
  return reCache.get(rule);
}

const encodeCapture = (s) => encodeURI(s).replace(/[?#]/g, encodeURIComponent);

/**
 * First matching rule → { location, status } (location is a site path or an absolute URL), else null.
 * @param {ReturnType<typeof normalizeRules>} rules
 * @param {string} pathname  request pathname as received (e.g. "/Foo/")
 * @param {string} [search]  request search incl. "?" (or "")
 */
export function matchRedirect(rules, pathname, search = "") {
  const incoming = new URLSearchParams(search);
  incoming.delete("_rsc"); // Next's RSC cache-buster, never part of the user's URL
  const reqPath = safeDecode(pathname);

  for (const rule of rules) {
    let dest = null;
    let passQuery = false;

    if (rule.regex) {
      const re = regexFor(rule);
      const m = re && reqPath.match(re);
      if (!m) continue;
      dest = rule.destination.replace(/\$(\d{1,2})/g, (_, n) => encodeCapture(m[n] ?? ""));
      passQuery = rule.query !== "ignore";
    } else {
      const qAt = rule.source.indexOf("?");
      const srcPath = qAt >= 0 ? rule.source.slice(0, qAt) : rule.source;
      const srcQuery = qAt >= 0 ? rule.source.slice(qAt + 1) : "";
      if (normPath(reqPath, rule) !== normPath(safeDecode(srcPath), rule)) continue;
      if (rule.query === "exact" && srcQuery) {
        // source carries its own query → same params in any order, nothing extra to pass on
        const want = new URLSearchParams(srcQuery);
        if (rule.ignoreCase) {
          if (paramKey(incoming).toLowerCase() !== paramKey(want).toLowerCase()) continue;
        } else if (paramKey(incoming) !== paramKey(want)) continue;
      } else {
        passQuery = rule.query !== "ignore"; // pass, or exact without a source query (lenient)
      }
      dest = rule.destination;
    }

    const templateRelative = !/^https?:\/\//i.test(rule.destination.trim());
    const safe = safeDest(dest);
    if (!safe) continue;
    // a relative template must stay a plain single-slash site path, whatever the capture groups held
    if (rule.regex && templateRelative && !/^\/(?!\/)/.test(safe)) continue;

    // loop guard: destination is the page being requested
    if (templateRelative) {
      const destPath = safeDecode(safe.split(/[?#]/)[0]).replace(/\/+$/, "") || "/";
      const here = reqPath.replace(/\/+$/, "") || "/";
      if (destPath === here) continue;
    }

    return { location: passQuery ? withQuery(safe, incoming) : safe, status: rule.code };
  }
  return null;
}
