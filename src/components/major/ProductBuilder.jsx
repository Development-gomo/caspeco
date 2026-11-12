// src/components/major/ProductBuilder.jsx
// Renders the ACF Flexible Content field "page_builder_products" on the Products CPT
// (Figma "Product_Page_Updated_29th_September"). Sections that already exist on the
// homepage are reused as-is; any homepage layout not listed here (KPI, data insight,
// integrations, insights …) is rendered by PageBuilder. Reused sections get a
// scroll reveal here so the homepage itself is unchanged.

import { withNeighbours, rows } from "@/lib/content";
import dynamic from "next/dynamic";
import { DEFAULT_LANG } from "@/config";
import PageBuilder from "./PageBuilder";
import Reveal from "@/components/ui/Reveal";
import { withSpacing } from "@/components/ui/SectionSpacing";
import IcpContactFormSection from "@/components/sections/contact-form/IcpContactFormSection";
import { getTwinCaseStudies, getMediaByIds, getLogoGalleries } from "@/lib/api";
import { mapTwinCases, twinMediaIds } from "@/lib/caseStudies";

const ProductHero = dynamic(() => import("../sections/product/ProductHero"));
const ProductUspAccordion = dynamic(() => import("../sections/product/ProductUspAccordion"));
const TestimonialSlider = dynamic(() => import("../sections/TestimonialSlider"));
const ClientQuoteSlider = dynamic(() => import("../sections/product/ClientQuoteSlider"));
const ProductFeatureSlider = dynamic(() => import("../sections/product/ProductFeatureSlider"));
const ProductResults = dynamic(() => import("../sections/product/ProductResults"));
const ProductDemo = dynamic(() => import("../sections/product/ProductDemo"));
const ProductSalesChannels = dynamic(() => import("../sections/product/ProductSalesChannels"));

// Reused homepage sections
const HomePartners = dynamic(() => import("../sections/home/HomePartners"));
const HomeProductCards = dynamic(() => import("../sections/home/HomeProductCards"));
const HomeBusinessTwin = dynamic(() => import("../sections/home/HomeBusinessTwin"));
const HomeFaq = dynamic(() => import("../sections/home/HomeFaq"));
const QuickContact = dynamic(() => import("../sections/contact-form/QuickContact"));

// Product page default for the card section (Figma "Casp_grad_top")
const CARDS_GRADIENT = "linear-gradient(180deg, rgba(218,220,221,0.8) 0.94%, rgba(255,255,255,0.5) 100.94%)";

async function prefetchSectionData(sections, lang) {
  // case studies feed the Business Twin and the testimonial slider
  const needsTwin = sections.some((b) => b._layout === "business_twin_section" || b._layout === "testimonial_slider_section");
  const needsLogos = sections.some((b) => b._layout === "logos_section" || b._layout === "home_partners_section");
  // testimonial bg_image sometimes arrives as a bare attachment ID instead of { url }
  const isAttachmentId = (v) => Number.isInteger(Number(v)) && Number(v) > 0 && typeof v !== "object";
  const bgIds = [
    ...new Set([
      ...sections
        .filter((b) => b._layout === "testimonial_slider_section" && isAttachmentId(b.bg_image))
        .map((b) => Number(b.bg_image)),
      ...sections
        .filter((b) => b._layout === "client_quote_slider_section")
        .flatMap((b) => rows(b.slider_type).map((r) => r.image).filter(isAttachmentId).map(Number)),
    ]),
  ];
  const [twinPosts, logos, bgMedia] = await Promise.all([
    needsTwin ? getTwinCaseStudies(lang) : null,
    needsLogos ? getLogoGalleries(lang) : null,
    bgIds.length ? getMediaByIds(bgIds) : null,
  ]);
  const twinCases = twinPosts ? mapTwinCases(twinPosts, await getMediaByIds(twinMediaIds(twinPosts))) : null;
  const bgById = bgMedia ? Object.fromEntries(bgMedia.map((m) => [m.id, { url: m.source_url, alt: m.alt_text || "" }])) : {};
  return { twinCases, logos, bgById };
}

export default async function ProductBuilder({ sections: rawSections, lang = DEFAULT_LANG, icpContactForm = false }) {
  const sections = withNeighbours(rawSections); // _prev/_next per block (Figma section-gap rule)
  if (!Array.isArray(sections) || sections.length === 0) return null;

  const prefetched = await prefetchSectionData(sections, lang);

  return (
    <>
      {sections.map((block, i) => {
        switch (block._layout) {
          // home_hero / home_partners_section: names used in the "Page Builder Products" group
          case "product_hero":
          case "home_hero":
            return <ProductHero key={i} data={block} lang={lang} />;

          case "logos_section":
          case "home_partners_section":
            return <HomePartners key={i} data={block} lang={lang} logos={prefetched.logos?.partners} />;

          case "product_cards_section":
            return (
              <Reveal key={i} y={40}>
                {withSpacing(block, <HomeProductCards data={{ ...block, bg_color: block.bg_color || CARDS_GRADIENT }} lang={lang} />)}
              </Reveal>
            );

          case "usp_accordion_section":
            return withSpacing(block, <ProductUspAccordion key={i} data={block} lang={lang} />, i);

          case "testimonial_slider_section":
            return <TestimonialSlider key={i} data={prefetched.bgById[Number(block.bg_image)] ? { ...block, bg_image: prefetched.bgById[Number(block.bg_image)] } : block} lang={lang} cases={prefetched.twinCases || []} defaultType="fullwidth" />;

          case "client_quote_slider_section": {
            const resolved = { ...block, slider_type: rows(block.slider_type).map((r) => (prefetched.bgById[Number(r.image)] ? { ...r, image: prefetched.bgById[Number(r.image)] } : r)) };
            return <ClientQuoteSlider key={i} data={resolved} lang={lang} />;
          }

          case "feature_slider_section":
            return <ProductFeatureSlider key={i} data={block} lang={lang} />;

          case "results_section":
            return withSpacing(block, <ProductResults key={i} data={block} lang={lang} />, i);

          case "product_demo_section":
            return <ProductDemo key={i} data={block} lang={lang} />;

          case "sales_channels_section":
            return <ProductSalesChannels key={i} data={block} lang={lang} />;

          case "business_twin_section":
            return (
              <Reveal key={i} y={40}>
                <HomeBusinessTwin data={block} lang={lang} cases={prefetched.twinCases} />
              </Reveal>
            );

          case "faq_section":
            return (
              <Reveal key={i} y={40}>
                {withSpacing(block, <HomeFaq data={block} lang={lang} />)}
              </Reveal>
            );

          case "quick_contact_section":
            return <QuickContact key={i} data={block} lang={lang} />;

          case "contact_form_section":
            // ICP pages only (icpContactForm); every other page keeps the default PageBuilder path below
            if (icpContactForm) return withSpacing(block, <IcpContactFormSection key={i} block={block} lang={lang} />, i);
            return (
              <Reveal key={i} y={40}>
                <PageBuilder sections={[block]} lang={lang} />
              </Reveal>
            );

          default:
            // Homepage / inner-page layouts (fetches are deduped across blocks by fetchWP),
            // revealed on scroll like the sections above
            return (
              <Reveal key={i} y={40}>
                <PageBuilder sections={[block]} lang={lang} />
              </Reveal>
            );
        }
      })}
    </>
  );
}
