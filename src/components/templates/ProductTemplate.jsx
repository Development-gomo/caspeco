// src/components/templates/ProductTemplate.jsx
// Single product (Products CPT): renders the ACF flexible field "page_builder_products"
// (field group "Page Builder Products"; "product_builder" from the generator script also works).
// Products without it fall back to the generic EntryTemplate.

import ProductBuilder from "@/components/major/ProductBuilder";
import EntryTemplate from "./EntryTemplate";
import Shell from "./Shell";

export default function ProductTemplate({ product, lang, slug, themeOptions }) {
  const sections = product?.acf?.page_builder_products || product?.acf?.product_builder;

  if (!Array.isArray(sections) || sections.length === 0) {
    return <EntryTemplate entry={product} entryType="products" routeType="product" lang={lang} slug={slug} themeOptions={themeOptions} />;
  }

  // A page-level quick contact section replaces the global one from Theme Options
  const hasQuickContact = sections.some((b) => b._layout === "quick_contact_section");

  return (
    <Shell
      lang={lang}
      slug={slug}
      entryType="products"
      routeType="product"
      entryId={product?.id}
      themeOptions={themeOptions}
      hideQuickContact={hasQuickContact}
    >
      <ProductBuilder sections={sections} lang={lang} />
    </Shell>
  );
}
