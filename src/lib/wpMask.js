// src/lib/wpMask.js
// Hides the WordPress backend from the browser (server-side only).
// Every string in WP responses is rewritten before it reaches a page or client:
//   https://cms-host/caspeco/wp-content/…  → /assets/…        (src/app/assets/uploads route)
//   https://cms-host/caspeco/wp-json/…     → /api/content/…  (src/app/api/content)
//   https://cms-host/caspeco/en/page/      → /en/page/       (permalinks become site paths)
// Works on plain and JSON-escaped ("https:\/\/…") URLs, e.g. inside Yoast's yoast_head.
// REST-only metadata (_links, guid) is dropped.

// Browser responses are already masked by /api/content, so nothing to do client-side
const WP_REST = typeof window === "undefined" ? process.env.NEXT_PUBLIC_WP_BASE || "" : "";

/** WP site URL without /wp-json, e.g. "https://gomowebb.com/caspeco" */
export const WP_SITE = WP_REST.replace(/\/wp-json\/?$/, "").replace(/\/$/, "");

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SLASH = String.raw`(?:\/|\\\/)`; // "/" or JSON-escaped "\/"

const site = WP_SITE ? new URL(WP_SITE) : null;
const HOST = site ? site.host.replace(/^www\./, "") : "";
const PATH = site ? site.pathname.split("/").filter(Boolean).map((p) => SLASH + escape(p)).join("") : "";

// groups: 1 = separator, 2 = WP core folder (only when one follows the site URL); 3 = separator, 4 = "nl-nl" (WPML directory → /nl)
const SITE_RE = site
  ? new RegExp(String.raw`https?:${SLASH}${SLASH}(?:www\.)?${escape(HOST)}${PATH}(?:(${SLASH})(wp-content|wp-json|wp-includes|wp-admin)(?=${SLASH})|(${SLASH})(nl-nl)(?![\w.-]))?(?![\w.-])`, "gi")
  : null;

export function maskWpString(value) {
  if (!SITE_RE || typeof value !== "string" || !value.includes(HOST)) return value;
  return value.replace(SITE_RE, (match, sep, kind, sep2, nl, offset, whole) => {
    if (nl) return `${sep2}nl`; // /nl-nl/… → /nl/… (WPML directory differs from our language code)
    // Media is served from our own domain (/assets/uploads/…, route handler in src/app/assets/uploads)
    if (kind === "wp-content") return `${sep}assets`;
    if (kind === "wp-json") return `${sep}api${sep}content`;
    if (kind === "wp-includes") return `${sep}static`; // core media icons, proxied in next.config.mjs
    if (kind === "wp-admin") return `${sep}admin`; // never linked publicly; just don't name it
    // permalink: keep the path that follows ("/en/page/"); bare site URL → "/"
    const next = whole[offset + match.length];
    return next === "/" || next === "\\" ? "" : "/";
  });
}

// REST metadata nobody renders; yoast_head is Yoast's raw <head> HTML (we use the JSON)
const DROP_KEYS = new Set(["_links", "guid", "yoast_head", "_acf_changed"]);
// Plugin-specific keys renamed so they don't show up in page payloads (posts passed to
// client components are serialized into the HTML). Code reads the new names:
const RENAME_KEYS = {
  acf_fc_layout: "_layout", // flexible content row → block._layout
  yoast_head_json: "seo", // entry.seo (lib/seo.js)
  "_yoast_wpseo_meta-robots-noindex": "noindex", // entry.meta.noindex (sitemap)
  class_list: "classes", // entry.classes, without WP's "hentry"
};

// ACF image/file objects carry ~1.3 KB of metadata nobody renders (every generated size, author, uploaded_to,
// menu_order …). Props passed to client components are serialized into the page twice (HTML + hydration data),
// so keep only what the code reads: url, alt, size, and mime_type / type (the hero video check).
const isMediaObject = (o) => typeof o.url === "string" && typeof o.mime_type === "string" && o.sizes && typeof o.sizes === "object";
function slimMedia(o) {
  const out = { url: maskWpString(o.url), alt: typeof o.alt === "string" ? o.alt : "", mime_type: o.mime_type, type: o.type };
  if (o.ID ?? o.id) out.id = o.ID ?? o.id;
  if (o.width) out.width = o.width;
  if (o.height) out.height = o.height;
  return out;
}

/** Deep-copy WP JSON with every CMS URL masked and plugin keys neutralised. */
export function maskWp(data) {
  if (typeof data === "string") return maskWpString(data);
  if (Array.isArray(data)) return data.map(maskWp);
  if (data && typeof data === "object") {
    if (isMediaObject(data)) return slimMedia(data);
    const out = {};
    for (const [k, v] of Object.entries(data)) {
      if (DROP_KEYS.has(k)) continue;
      out[RENAME_KEYS[k] || k] = k === "class_list" && Array.isArray(v) ? v.filter((c) => c !== "hentry") : maskWp(v);
    }
    return out;
  }
  return data;
}
