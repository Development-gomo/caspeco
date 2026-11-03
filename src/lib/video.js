// src/lib/video.js
// Video link helpers for sections that play a video in place (no popup).
// The embed rules are a copy of ui/VideoModal.jsx — keep the two in step.

// Uploaded / direct video files play in a <video>; YouTube, Vimeo and Loom in their players;
// any other link (Wistia, a hosted player page …) is embedded as an iframe.
const FILE = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#]|$)/i;

// "1m30s" / "90" → 90
const seconds = (t) => {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
};

const parse = (url) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

const hostOf = (u) => u.hostname.replace(/^(www|m)\./, "");

/**
 * ACF url / file field → playable link, or "".
 * "www.youtube.com/…" and "//player.vimeo.com/…" get https; site-relative paths
 * ("/assets/clip.mp4") are kept; legacy attachment IDs ("1460") and other text are dropped.
 */
export function videoUrl(value) {
  const v = value && typeof value === "object" ? value.url : value;
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (!s || /^\d+$/.test(s)) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (/^www\./i.test(s)) return `https://${s}`;
  if (s.startsWith("/")) return s;
  return "";
}

/** YouTube video ID from watch?v=, youtu.be/, embed/, shorts/, live/, v/ and youtube-nocookie.com links. */
export function youtubeId(url) {
  const u = parse(url);
  if (!u) return null;
  const host = hostOf(u);
  const id =
    host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com"
      ? u.searchParams.get("v") || u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1]
      : host === "youtu.be"
        ? u.pathname.slice(1, 12)
        : null;
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

/** YouTube poster frame (480×360, letterboxed — use object-cover in a 16:9 box). */
export function youtubePoster(url) {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
}

/** Autoplaying embed URL for a video link, or null when it should play in a <video> (file / relative path). */
export function embedUrl(url) {
  const u = parse(url);
  if (!u) return null;
  const host = hostOf(u);

  const yt = youtubeId(url);
  if (yt) {
    const start = seconds(u.searchParams.get("t") || u.searchParams.get("start"));
    return `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0${start ? `&start=${start}` : ""}`;
  }

  // Vimeo: vimeo.com/123, vimeo.com/123/<hash> (unlisted), /channels|groups/…/123, player.vimeo.com/video/123?h=…
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(?:^|\/)(\d{6,})(?:\/([\da-f]{6,}))?/i);
    if (m) {
      const hash = m[2] || u.searchParams.get("h");
      return `https://player.vimeo.com/video/${m[1]}?autoplay=1${hash ? `&h=${hash}` : ""}`;
    }
  }

  // Loom share links have an embed twin
  if (host === "loom.com") {
    const id = u.pathname.match(/\/(?:share|embed)\/([\w-]+)/)?.[1];
    if (id) return `https://www.loom.com/embed/${id}?autoplay=1`;
  }

  return FILE.test(u.pathname) ? null : url;
}
