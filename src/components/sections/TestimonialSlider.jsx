// src/components/sections/TestimonialSlider.jsx
// Picks the testimonial layout from the ACF "Slider Type" select (slider_type), shared by
// the Product layout testimonial_slider_section and the Industry layout
// industry_testimonials_section. Both get their slides from the case studies (`cases`).
//   fullwidth → ProductTestimonials: one quote at a time over the case's full-width photo
//   card      → IndustryTestimonials: frosted quote cards in a carousel over the section bg
// `defaultType` is the layout's ACF default, used when the field is empty (older rows).
// select_case set -> only that case; empty -> default list.

import dynamic from "next/dynamic";
import { casesForSlider } from "@/lib/caseStudies";

const ProductTestimonials = dynamic(() => import("./product/ProductTestimonials"));
const IndustryTestimonials = dynamic(() => import("./industry/IndustryTestimonials"));

export default function TestimonialSlider({ data, lang, cases = [], defaultType = "fullwidth" }) {
  const { select_case, ...rest } = data || {};
  const list = casesForSlider(cases, select_case);
  const type = data?.slider_type === "card" || data?.slider_type === "fullwidth" ? data.slider_type : defaultType;
  return type === "card" ? (
    <IndustryTestimonials data={rest} lang={lang} cases={list} variant="industry" />
  ) : (
    <ProductTestimonials data={rest} lang={lang} cases={list} />
  );
}
