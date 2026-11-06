// src/lib/content.js
// Helpers for rendering ACF fields consistently across section components.

/**
 * Turn a CMS text value into HTML for dangerouslySetInnerHTML.
 * WYSIWYG fields already contain markup; textarea fields are plain text where
 * line breaks are meaningful, so they become <br>. Inline tags typed into a
 * textarea (e.g. <strong>last month</strong>) are kept, so editors can mark
 * the yellow highlight in either field type.
 */
// Plain-text quote wrapped in curly quotes (“…”); HTML quotes and empty values are returned as is
export function curlyQuote(q) {
  if (!q || /<[a-z][\s\S]*>/i.test(q)) return q;
  return `“${q.trim().replace(/^["“”']+|["“”']+$/g, "")}”`;
}

export function toHtml(value) {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (/<(p|h[1-6]|ul|ol|div)[\s>]/i.test(trimmed)) return trimmed;
  return trimmed.replace(/\r?\n/g, "<br />");
}

/**
 * Default yellow highlight for headings typed as plain text (no markup):
 *  - "lastLine":   last line of a multi-line heading ("Best-performing customers\nlast month")
 *  - "firstToken": a leading token containing a digit ("100+ integrations")
 * If the editor marked bold text themselves, that is used instead.
 */
export function highlightHtml(value, mode) {
  if (!value || typeof value !== "string") return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return toHtml(value);
  const text = value.trim();
  if (mode === "lastLine") {
    const lines = text.split(/\r?\n/);
    if (lines.length > 1) {
      const last = lines.pop();
      return `${lines.join("<br />")}<br /><strong>${last}</strong>`;
    }
  }
  if (mode === "firstToken") {
    const match = text.match(/^(\S*\d\S*)(\s+)([\s\S]*)$/);
    if (match) return `<strong>${match[1]}</strong>${match[2]}${toHtml(match[3])}`;
  }
  return toHtml(text);
}

/** Return a non-empty array or [] — ACF returns false/"" for empty repeaters. */
export function rows(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

/** URL of an ACF image/file field (array return format) or a plain string. */
export function mediaUrl(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.url || "";
}

/**
 * Inline style for a section from its "Styling" tab (bg_color / bg_image).
 * Falls back to the design's default background when neither is set.
 */
export function sectionBackground(data, fallback = {}) {
  const color = data?.bg_color;
  const image = mediaUrl(data?.bg_image);
  if (!color && !image) return fallback;
  return {
    ...(color ? { background: color } : {}),
    ...(image
      ? {
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
  };
}

/** Estimated reading time in minutes from rendered post HTML (200 wpm). */
export function readingMinutes(html) {
  const words = (html || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Tags every flexible-content block with its neighbours' layouts (_prev / _next), once,
 * at the top-level builder. The tags travel with the block through nested builders
 * (Industry → Product → Page), so a section can apply the Figma spacing rule:
 * two consecutive light sections share one 144px gap (e.g. 72 + 72) instead of 144 + 144.
 */
export function withNeighbours(sections) {
  if (!Array.isArray(sections)) return sections;
  if (sections.some((b) => b && "_prev" in b)) return sections; // already tagged upstream
  return sections.map((b, i) => (b ? { ...b, _prev: sections[i - 1]?._layout || null, _next: sections[i + 1]?._layout || null } : b));
}

// Bold markers: **text**, <strong>text</strong>, <b>text</b> (tag names case-insensitive)
const CHAT_BOLD_PATTERN = /\*\*([\s\S]+?)\*\*|<(strong|b)\b[^>]*>([\s\S]*?)<\/\2\s*>/gi;
const CHAT_ENTITIES = { "&amp;": "&", "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&#39;": "'", "&quot;": '"' };

/** Strip remaining tags, then decode the supported entities (single pass, so &amp;lt; stays literal). */
function chatPlainText(value) {
  return value.replace(/<\/?[a-z][^>]*>/gi, "").replace(/&(amp|nbsp|lt|gt|#39|quot);/gi, (m) => CHAT_ENTITIES[m.toLowerCase()]);
}

/**
 * Parse chat/CMS text into plain-data segments: [{ text, bold }].
 * Bold comes from **…**, <strong> or <b>; other tags are dropped (inner text kept),
 * <br> becomes "\n". Adjacent segments with the same bold value are merged.
 * No HTML is generated, so the result is safe to render as text nodes.
 */
export function parseChatText(input) {
  if (typeof input !== "string" || !input.trim()) return [];
  const source = input.replace(/<br\s*\/?>/gi, "\n");
  const segments = [];
  const push = (text, bold) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.bold === bold) last.text += text;
    else segments.push({ text, bold });
  };
  let cursor = 0;
  for (const match of source.matchAll(CHAT_BOLD_PATTERN)) {
    push(chatPlainText(source.slice(cursor, match.index)), false);
    push(chatPlainText(match[1] ?? match[3]), true);
    cursor = match.index + match[0].length;
  }
  push(chatPlainText(source.slice(cursor)), false);
  return segments;
}

/** First `n` characters across segments (n <= 0 gives []; n >= total gives everything). */
export function sliceSegments(segments, n) {
  if (!Array.isArray(segments) || !(n > 0)) return [];
  let left = Math.floor(n);
  const out = [];
  for (const seg of segments) {
    if (left <= 0) break;
    const text = typeof seg?.text === "string" ? seg.text : "";
    if (!text) continue;
    const kept = text.length <= left ? text : text.slice(0, left);
    out.push({ text: kept, bold: !!seg.bold });
    left -= kept.length;
  }
  return out;
}

/** Total character count across segments. */
export function countSegmentChars(segments) {
  if (!Array.isArray(segments)) return 0;
  return segments.reduce((sum, seg) => sum + (typeof seg?.text === "string" ? seg.text.length : 0), 0);
}
