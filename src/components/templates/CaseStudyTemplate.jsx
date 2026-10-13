// src/components/templates/CaseStudyTemplate.jsx
// Single case study — /case/{slug}, /en/case/{slug} …

import CaseStudyBuilder from "@/components/major/CasestudyBuilder";
import Shell from "./Shell";

export default function CaseStudyTemplate({ caseStudy, lang, slug, menu, themeOptions }) {
  return (
    <Shell lang={lang} slug={slug} entryType="casestudies" routeType="casestudy" entryId={caseStudy?.id} menu={menu} themeOptions={themeOptions}>
      <CaseStudyBuilder sections={caseStudy?.acf?.case_study_builder} lang={lang} />
    </Shell>
  );
}
