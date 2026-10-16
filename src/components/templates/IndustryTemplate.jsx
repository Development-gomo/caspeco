// src/components/templates/IndustryTemplate.jsx
// Single industry (Industries CPT): renders the ACF flexible field "page_builder_industry"
// (field group "Page Builder Industry"; "page_builder_industries" from the generator script
// also works). Industries without it fall back to the generic EntryTemplate.

import IndustryBuilder from "@/components/major/IndustryBuilder";
import EntryTemplate from "./EntryTemplate";
import Shell from "./Shell";

export default function IndustryTemplate({ industry, lang, slug, themeOptions }) {
  const sections = industry?.acf?.page_builder_industry || industry?.acf?.page_builder_industries;

  if (!Array.isArray(sections) || sections.length === 0) {
    return <EntryTemplate entry={industry} entryType="industries" routeType="industry" lang={lang} slug={slug} themeOptions={themeOptions} />;
  }

  // A page-level quick contact section replaces the global one from Theme Options
  const hasQuickContact = sections.some((b) => b._layout === "quick_contact_section");

  return (
    <Shell
      lang={lang}
      slug={slug}
      entryType="industries"
      routeType="industry"
      entryId={industry?.id}
      themeOptions={themeOptions}
      hideQuickContact={hasQuickContact}
    >
      <IndustryBuilder sections={sections} lang={lang} currentId={industry?.id} />
    </Shell>
  );
}
