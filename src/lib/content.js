// src/lib/content.js
// Helpers for rendering ACF fields consistently across section components.

/**
 * Turn a CMS text value into HTML for dangerouslySetInnerHTML.
 * WYSIWYG fields already contain markup; textarea fields are plain text where
 * line breaks are meaningful, so they become <br>. Inline tags typed into a
 * textarea (e.g. <strong>last month</strong>) are kept, so editors can mark
 * the yellow highlight in either field type.
 */
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
