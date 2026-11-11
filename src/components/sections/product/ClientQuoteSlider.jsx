// ACF layout: client_quote_slider_section ("Client Quote Slider Section", Product pages).
// Same full-width quote slider as the case-study testimonial, but the slides come from the layout's own
// repeater (slider_type rows: image, quote, client_name, company_name). Figma "Quote" frame: 80px section padding.
import ProductTestimonials from "./ProductTestimonials";
import { DEFAULT_LANG } from "@/config";
import { mediaUrl, rows } from "@/lib/content";

export default function ClientQuoteSlider({ data, lang = DEFAULT_LANG }) {
  const slides = rows(data?.slider_type).map((r) => ({ bg: mediaUrl(r.image), quote: r.quote, name: r.client_name, company: r.company_name })).filter((s) => s.quote);
  if (slides.length === 0) return null;
  return <ProductTestimonials data={{ heading: data?.heading, bg_color: data?.bg_color }} lang={lang} slides={slides} compact />;
}
