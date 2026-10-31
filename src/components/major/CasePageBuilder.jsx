// src/components/major/CasePageBuilder.jsx
// Renders the ACF Flexible Content field "page_builder" of the Case Studies CPT
// (field group "Page Builder Case study"). Case-study-only layouts are handled here; every
// other layout (home_hero, content_section, home_kpi_section, usp_accordion_section,
// faq_section, contact_form_section, insights_section, industry_slider_section,
// large_content_section …) is rendered by ProductBuilder → PageBuilder, so the case page
// looks like the rest of the site. Older cases that still use "case_study_builder" are
// rendered by CasestudyBuilder (see CaseStudyTemplate).

import dynamic from "next/dynamic";
import { withNeighbours, rows } from "@/lib/content";
import { DEFAULT_LANG } from "@/config";
import ProductBuilder from "./ProductBuilder";
import { getTwinCaseStudies, getMediaByIds } from "@/lib/api";
import { mapTwinCases, twinMediaIds } from "@/lib/caseStudies";

const HomeHero = dynamic(() => import("../sections/home/HomeHero"));
const IntroFeature = dynamic(() => import("../sections/case-study/IntroFeature"));
const RelatedCases = dynamic(() => import("../sections/case-study/RelatedCases"));
const IndustryChallenges = dynamic(() => import("../sections/industry/IndustryChallenges"));
const ProductTestimonials = dynamic(() => import("../sections/product/ProductTestimonials"));

export default async function CasePageBuilder({ sections: rawSections, lang = DEFAULT_LANG, currentId }) {
  const sections = withNeighbours(rawSections); // _prev/_next per block (Figma section-gap rule)
  if (!Array.isArray(sections) || sections.length === 0) return null;

  // Related cases: every case of this language except the one being viewed
  const needsCases = sections.some((b) => b._layout === "case_study_slider");
  const casePosts = needsCases ? await getTwinCaseStudies(lang) : null;
  const cases = casePosts?.length
    ? mapTwinCases(casePosts, await getMediaByIds(twinMediaIds(casePosts))).filter((c) => c.id !== currentId)
    : [];

  const renderBlock = (block, i) => {
        switch (block._layout) {
          // Same hero as the homepage
          case "home_hero":
            return <HomeHero key={i} data={block} lang={lang} />;

          case "case_feature_cards":
            return <IntroFeature key={i} data={block} lang={lang} />;

          // Cards (icon, label, text) → the Industry "Challenges" cards (icon, value, text)
          case "challenges_and_solution":
            return (
              <IndustryChallenges
                key={i}
                lang={lang}
                data={{ ...block, items: rows(block.cards).map((c) => ({ icon: c.icon, value: c.label, text: c.text })) }}
              />
            );

          // Quotes typed on the case itself → the product "full width" testimonial slider
          case "testimonial_section":
            return (
              <ProductTestimonials
                key={i}
                lang={lang}
                data={block}
                cases={rows(block.testimonial).map((t) => ({ quote: t.testimonial_text, personName: t.person_name, designation: t.designation }))}
              />
            );

          case "case_study_slider":
            return <RelatedCases key={i} data={block} lang={lang} cases={cases} />;

          default:
            return <ProductBuilder key={i} sections={[block]} lang={lang} />;
        }
  };

  return (
    <>
      {sections.map((block, i) => (
        // The hero's default CTA link (#next-section) scrolls to the section after it
        <div key={i} id={i === 1 ? "next-section" : undefined}>
          {renderBlock(block, i)}
        </div>
      ))}
    </>
  );
}
