// ACF layout: client_quote_slider_section ("Client Quote Slider Section", Product pages).
// Same full-width quote slider as the case-study testimonial, but the slides come from the layout's own
// repeater (slider_type rows: image, quote, client_name, company_name, case_logo, case_cta_text, case_link). Figma "Quote" frame: 80px section padding.
// On mobile (< 768px) the slider becomes swipeable glass quote cards with dots (mobileGrid prop, ui/MobileSlider); desktop is unchanged.
// case_logo (image) shows above the quote and case_cta_text + case_link (text link, bottom right of the name row) only in those
// mobile cards; the link needs both text and URL. Empty fields → the cards render exactly as before.
import ProductTestimonials from "./ProductTestimonials";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHref } from "@/config";
import { mediaUrl, rows } from "@/lib/content";

// case_link (ACF text field) → site href. Site paths get the language prefix unless they already have one
// (wpMask already turns pasted CMS URLs into "/en/..." paths, langHref would double it); caspeco.com URLs are reduced
// to their path; any other absolute URL is used as entered.
function caseHref(raw, lang) {
  const v = typeof raw === "string" ? raw.trim() : "";
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      return /^(?:www\.)?caspeco\.com$/i.test(u.hostname) ? `${u.pathname}${u.search}${u.hash}` : v;
    } catch {
      return "";
    }
  }
  if (v.startsWith("/")) return SUPPORTED_LANGS.includes(v.split("/")[1]) ? v : langHref(v, lang);
  return "";
}

export default function ClientQuoteSlider({ data, lang = DEFAULT_LANG }) {
  const slides = rows(data?.slider_type)
    .map((r) => {
      const ctaText = typeof r.case_cta_text === "string" ? r.case_cta_text.trim() : "";
      const ctaHref = caseHref(r.case_link, lang);
      return {
        bg: mediaUrl(r.image),
        quote: r.quote,
        name: r.client_name,
        company: r.company_name,
        // deliberately NOT `logo`: that key is shown on the desktop slide (case pages), this one is mobile only
        caseLogo: r.case_logo?.url ? { url: r.case_logo.url, alt: r.case_logo.alt || "", width: r.case_logo.width, height: r.case_logo.height } : null,
        caseCta: ctaText && ctaHref ? { text: ctaText, href: ctaHref } : null,
      };
    })
    .filter((s) => s.quote);
  if (slides.length === 0) return null;
  return <ProductTestimonials data={{ heading: data?.heading, bg_color: data?.bg_color }} lang={lang} slides={slides} compact mobileGrid />;
}
