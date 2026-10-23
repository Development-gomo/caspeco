// src/components/templates/IcpTemplate.jsx
// Single ICP page (CPT "icp", e.g. /en/icp/opening-soon/): renders the ACF flexible field
// "page_builder_icp" (field group "Page Builder ICP Page"). Entries without it fall back to
// the generic EntryTemplate.

import IcpBuilder from "@/components/major/IcpBuilder";
import EntryTemplate from "./EntryTemplate";
import Shell from "./Shell";

export default function IcpTemplate({ icp, lang, slug, themeOptions }) {
  const sections = icp?.acf?.page_builder_icp;

  if (!Array.isArray(sections) || sections.length === 0) {
    return <EntryTemplate entry={icp} entryType="icp" routeType="icp" lang={lang} slug={slug} themeOptions={themeOptions} />;
  }

  // A page-level contact section replaces the global quick contact from Theme Options
  const hasContact = sections.some((b) => b._layout === "quick_contact_section" || b._layout === "contact_form_section");

  return (
    <Shell lang={lang} slug={slug} entryType="icp" routeType="icp" entryId={icp?.id} themeOptions={themeOptions} hideQuickContact={hasContact}>
      <IcpBuilder sections={sections} lang={lang} currentId={icp?.id} />
    </Shell>
  );
}
