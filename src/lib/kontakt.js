// src/lib/kontakt.js
// Helpers for "kontakt" (team member) posts used by the IcpBuilder contact-person
// section. Shapes a kontakt post into { name, role, tag, photo } and resolves the
// selected team_member ID from ACF relationship values.

const decode = (s) =>
  String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();

const featured = (post) => {
  const m = post?._embedded?.["wp:featuredmedia"]?.[0];
  return m?.source_url ? { url: m.source_url, alt: m.alt_text || "" } : null;
};

// kontakt post → { name, role, tag, photo } (role = ACF "titel", location from its ACF when exposed to REST)
export function toPerson(post) {
  const acf = post?.acf && !Array.isArray(post.acf) ? post.acf : {};
  return {
    name: decode(post?.title?.rendered),
    role: acf.titel || "",
    tag: acf.location || acf.office || acf.city || acf.tag || "",
    photo: featured(post),
  };
}

export const firstPostId = (v) => {
  const x = Array.isArray(v) ? v[0] : v;
  return x && typeof x === "object" ? x.ID || x.id : x;
};

export const contactPersonId = (b) => (b?.contact_person === "enable" ? Number(firstPostId(b.team_member)) || null : null);
