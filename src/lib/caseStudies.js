// src/lib/caseStudies.js
// Server-side mapping of "casestudies" CPT entries for the homepage Business Twin
// section. Keeps only what the section needs, so the large post body never
// reaches the client.
//
// Case-study ACF fields used (Show in REST API = on):
//   select_industry   industry name (dropdown 1 options come from these values)
//   select_venues     number of venues (dropdown 2 options come from these values)
//   logo              Image (ID)        → resolved to a URL via the media endpoint
//   title_label       customer name (logo alt / text fallback)
//   testimonial       quote
//   text_line_1 / data_1, text_line_2 / data_2   the two stats
//   video_url         File (ID) or URL  → "See clip"

const decode = (s) =>
  String(s || "")
    .replace(/&#0?38;|&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;|&#8220;|&#8221;/g, '"');

const clean = (v) => (v === null || v === undefined || v === false ? "" : String(v).trim());

// ACF image/file fields here return an ID; tolerate array/URL formats too
const mediaId = (v) => (typeof v === "number" ? v : /^\d+$/.test(clean(v)) ? Number(v) : null);

/** Media IDs referenced by the cases (logos + uploaded clips), for one batch fetch. */
export function twinMediaIds(posts) {
  const ids = new Set();
  for (const p of Array.isArray(posts) ? posts : []) {
    [p?.acf?.logo, p?.acf?.video_url].forEach((v) => {
      const id = mediaId(v);
      if (id) ids.add(id);
    });
  }
  return [...ids];
}

function resolveMedia(value, mediaById) {
  const id = mediaId(value);
  if (id) return mediaById.get(id) || null;
  if (value && typeof value === "object" && value.url) return { url: value.url, alt: value.alt || "" };
  if (typeof value === "string" && /^https?:\/\//.test(value)) return { url: value, alt: "" };
  return null;
}

/** Map raw CPT entries (newest first) to small case objects. */
export function mapTwinCases(posts, media = []) {
  const mediaById = new Map(
    (Array.isArray(media) ? media : []).map((m) => [m.id, { url: m.source_url, alt: m.alt_text || "" }])
  );

  return (Array.isArray(posts) ? posts : []).map((post) => {
    const acf = post?.acf && !Array.isArray(post.acf) ? post.acf : {};
    const featured = post?._embedded?.["wp:featuredmedia"]?.[0];
    return {
      id: post.id,
      slug: post.slug,
      title: clean(acf.title_label) || decode(post?.title?.rendered),
      image: featured?.source_url ? { url: featured.source_url, alt: featured.alt_text || "" } : null,
      industry: clean(acf.select_industry),
      venues: clean(acf.select_venues),
      logo: resolveMedia(acf.logo, mediaById),
      quote: clean(acf.testimonial),
      stats: [
        { value: clean(acf.data_1), label: clean(acf.text_line_1) },
        { value: clean(acf.data_2), label: clean(acf.text_line_2) },
      ].filter((s) => s.value),
      clipUrl: resolveMedia(acf.video_url, mediaById)?.url || "",
    };
  });
}

/** Unique dropdown options from the cases' own values. */
export function twinOptions(cases) {
  const industries = new Set();
  const venues = new Set();
  for (const c of cases) {
    if (c.industry) industries.add(c.industry);
    if (c.venues) venues.add(c.venues);
  }
  const leadingNumber = (v) => parseFloat(String(v).match(/\d+/)?.[0] ?? "Infinity");
  return {
    industries: [...industries].sort((a, b) => a.localeCompare(b)).map((v) => ({ value: v, label: v })),
    venues: [...venues].sort((a, b) => leadingNumber(a) - leadingNumber(b)).map((v) => ({ value: v, label: v })),
  };
}
