// src/components/templates/CaseStudyTemplate.jsx
// Single case study — /case/{slug}, /en/case/{slug} …
// New cases use the "Page Builder Case study" field (page_builder); older ones still hold
// case_study_builder and keep their original layouts.

import CaseStudyBuilder from "@/components/major/CasestudyBuilder";
import CasePageBuilder from "@/components/major/CasePageBuilder";
import Shell from "./Shell";

export default function CaseStudyTemplate({ caseStudy, lang, slug, themeOptions }) {
  const acf = caseStudy?.acf || {};
  const hasPageBuilder = Array.isArray(acf.page_builder) && acf.page_builder.length > 0;

  const hasForm = hasPageBuilder && acf.page_builder.some((b) => b?._layout === "contact_form_section" || b?._layout === "quick_contact_section");

  return (
    <Shell lang={lang} slug={slug} entryType="casestudies" routeType="casestudy" entryId={caseStudy?.id} themeOptions={themeOptions} hideQuickContact={hasForm}>
      {hasPageBuilder ? (
        <CasePageBuilder sections={acf.page_builder} lang={lang} currentId={caseStudy?.id} />
      ) : (
        <CaseStudyBuilder sections={acf.case_study_builder} lang={lang} />
      )}
    </Shell>
  );
}
