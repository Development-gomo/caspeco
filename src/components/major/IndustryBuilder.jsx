// src/components/major/IndustryBuilder.jsx
// Renders the ACF Flexible Content field "page_builder_industry" on the Industries CPT
// (Figma "Industry_Page"). Only the three industry-specific sections live here; every
// other layout (hero, logos, product cards, FAQ, quick contact, help tabs, restaurant
// map, insights …) is rendered by ProductBuilder, which falls back to PageBuilder.

import { withNeighbours } from "@/lib/content";
import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import ProductBuilder from "./ProductBuilder";
import Reveal from "@/components/ui/Reveal";
import { getAllIndustries, getTwinCaseStudies, getMediaByIds } from "@/lib/api";
import { mapTwinCases, twinMediaIds } from "@/lib/caseStudies";

const IndustryChallenges = dynamic(() => import("../sections/industry/IndustryChallenges"));
const IndustryResults = dynamic(() => import("../sections/industry/IndustryResults"));
const TestimonialSlider = dynamic(() => import("../sections/TestimonialSlider"));
const HomeIndustrySlider = dynamic(() => import("../sections/home/HomeIndustrySlider"));

export default async function IndustryBuilder({ sections: rawSections, lang = DEFAULT_LANG, currentId }) {
  const sections = withNeighbours(rawSections); // _prev/_next per block (Figma section-gap rule)
  if (!Array.isArray(sections) || sections.length === 0) return null;

  // "Explore other industry": every industry except the one being viewed
  const needsIndustries = sections.some((b) => b._layout === "industry_slider_section");
  // Testimonial carousel → slides/cards come from the case studies
  const needsCases = sections.some((b) => b._layout === "industry_testimonials_section");
  const [industries, casePosts] = await Promise.all([
    needsIndustries ? getAllIndustries(lang) : null,
    needsCases ? getTwinCaseStudies(lang) : null,
  ]);
  const otherIndustries = Array.isArray(industries) ? industries.filter((p) => p.id !== currentId) : [];
  const cases = casePosts?.length ? mapTwinCases(casePosts, await getMediaByIds(twinMediaIds(casePosts))) : [];

  return (
    <>
      {sections.map((block, i) => {
        switch (block._layout) {
          case "industry_challenges_section":
            return <IndustryChallenges key={i} data={block} lang={lang} />;

          case "industry_results_section":
            return <IndustryResults key={i} data={block} lang={lang} />;

          case "industry_testimonials_section":
            return <TestimonialSlider key={i} data={block} lang={lang} cases={cases} defaultType="card" />;

          case "industry_slider_section":
            return (
              <Reveal key={i} y={40}>
                <HomeIndustrySlider data={block} lang={lang} prefetchedIndustries={otherIndustries} />
              </Reveal>
            );

          default:
            return <ProductBuilder key={i} sections={[block]} lang={lang} />;
        }
      })}
    </>
  );
}
