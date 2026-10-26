// src/components/major/IcpBuilder.jsx
// Renders the ACF flexible field "page_builder_icp" on the ICP CPT (field group "Page Builder
// ICP Page"; Figma Opening_soon / Levelling_up / Adding_Locations / Operating_at_scale).
// ICP-specific layouts and the ones whose data needs resolving live here; everything else
// (hero, logos, FAQ, KPI, integrations, data insight, business twin …) goes through
// ProductBuilder, which falls back to PageBuilder.
//
// Data resolved server-side:
//  - testimonial_slider_section → latest case studies; slider_type "card" = glass card carousel,
//    "fullwidth" = full-width photo slider. A bg_image saved as a media ID is resolved too.
//  - team_section / contact_form_section → "kontakt" posts (name + featured photo)
//  - related_icp → the other ICP pages (title, excerpt, featured image, link)

import dynamic from "next/dynamic";
import { DEFAULT_LANG, entryHref, langHref } from "@/config";
import { withNeighbours } from "@/lib/content";
import ProductBuilder from "./ProductBuilder";
import { getAllIcps, getKontaktByIds, getMediaByIds, getThemeOptions, getTwinCaseStudies } from "@/lib/api";
import { mapTwinCases, twinMediaIds } from "@/lib/caseStudies";
import { parseHubspotEmbed } from "@/lib/hubspot";
import { SWITCH_GRADIENT } from "@/components/sections/icp/SwitchSteps";

// Figma ICP "Hero": image + linear black 70% → 30%, left → right
const HERO_OVERLAY = "linear-gradient(90deg, rgba(0, 0, 0, 0.7) 2.8%, rgba(0, 0, 0, 0.3) 103%)";

const IcpIntro = dynamic(() => import("../sections/icp/IcpIntro"));
const SystemCheck = dynamic(() => import("../sections/icp/SystemCheck"));
const SwitchSteps = dynamic(() => import("../sections/icp/SwitchSteps"));
const PeopleCards = dynamic(() => import("../sections/icp/PeopleCards"));
const StageCards = dynamic(() => import("../sections/icp/StageCards"));
const ContactRep = dynamic(() => import("../sections/icp/ContactRep"));

// Figma 324:7454 "Contact form" copy (labels / placeholders); the rep's first name is filled in.
// The CF7 form picked in "Select Form" must use these field names: full_name, company,
// contact_method (call | email), email, phone, message, consent, newsletter
function repFormData(block, rep, privacyHref) {
  const first = (rep?.name || "").split(" ")[0] || "us";
  const privacy = privacyHref ? `<a href="${privacyHref}">privacy policy.</a>` : "privacy policy.";
  return {
    ...block,
    form_provider: "cf7",
    form_shortcode: String(postId(block.select_form) || ""),
    name_label: "Full name",
    name_placeholder: "Anna Lindqvist",
    company_label: "Restaurant or company",
    company_placeholder: "Bistro Norr",
    method_label: `How should ${first} reach you?`,
    email_label: "Email",
    email_placeholder: "anna@bistronorr.se",
    phone_label: "Phone",
    phone_placeholder: "+46 70 123 45 67",
    message_label: "Anything we should know? (optional)",
    message_placeholder: "E.g. number of venues, opening date, current system",
    consent_text: `I agree that Caspeco stores my details to contact me, as described in the ${privacy}`,
    consent_field_name: "consent",
    newsletter_text: "Send me occasional tips and news for restaurants. (optional)",
    newsletter_field_name: "newsletter",
    cta_text: rep?.name ? `Send to ${first}` : block.cta_text || "Send",
  };
}
const ProductSalesChannels = dynamic(() => import("../sections/product/ProductSalesChannels"));
const ProductUspAccordion = dynamic(() => import("../sections/product/ProductUspAccordion"));
const ProductResults = dynamic(() => import("../sections/product/ProductResults"));
const HomeDataInsight = dynamic(() => import("../sections/home/HomeDataInsight"));
const HomeKpi = dynamic(() => import("../sections/home/HomeKpi"));
const ProductHero = dynamic(() => import("../sections/product/ProductHero"));
const ProductTestimonials = dynamic(() => import("../sections/product/ProductTestimonials"));
const IndustryTestimonials = dynamic(() => import("../sections/industry/IndustryTestimonials"));
const QuickContact = dynamic(() => import("../sections/contact-form/QuickContact"));
const HubspotEmbed = dynamic(() => import("../ui/HubspotEmbed"));

const decode = (s) =>
  String(s || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();

const postId = (p) => (p && typeof p === "object" ? p.ID || p.id : p);
// team_member is a multi-select post object ("Select only one") → first entry
const firstId = (v) => postId(Array.isArray(v) ? v[0] : v);
// contact_form_section: "Contact Person Section" button group (enable / disable, default disable)
const withContactPerson = (b) => b.contact_person === "enable";
const featured = (post) => {
  const m = post?._embedded?.["wp:featuredmedia"]?.[0];
  return m?.source_url ? { url: m.source_url, alt: m.alt_text || "" } : null;
};

// kontakt post → { name, role, tag, photo } (role = ACF "titel", location from its ACF when exposed to REST)
function toPerson(post) {
  const acf = post?.acf && !Array.isArray(post.acf) ? post.acf : {};
  return {
    name: decode(post?.title?.rendered),
    role: acf.titel || "",
    tag: acf.location || acf.office || acf.city || acf.tag || "",
    photo: featured(post),
  };
}

async function prefetch(sections, lang) {
  const memberIds = [];
  const mediaIds = [];
  for (const b of sections) {
    if (b._layout === "team_section") memberIds.push(...(Array.isArray(b.select_team_member) ? b.select_team_member : [b.select_team_member]).map(postId));
    if (b._layout === "contact_form_section" && withContactPerson(b)) memberIds.push(firstId(b.team_member));
    if (typeof b.bg_image === "number" || /^\d+$/.test(String(b.bg_image || ""))) mediaIds.push(Number(b.bg_image));
  }
  const needsCases = sections.some((b) => b._layout === "testimonial_slider_section");
  const needsIcps = sections.some((b) => b._layout === "related_icp");
  const needsOptions = sections.some((b) => b._layout === "contact_form_section");

  const [casePosts, icps, members, media, options] = await Promise.all([
    needsCases ? getTwinCaseStudies(lang) : null,
    needsIcps ? getAllIcps(lang) : null,
    memberIds.filter(Boolean).length ? getKontaktByIds(memberIds, lang) : [],
    mediaIds.length ? getMediaByIds(mediaIds) : [],
    needsOptions ? getThemeOptions(lang).catch(() => null) : null,
  ]);

  const cases = casePosts?.length ? mapTwinCases(casePosts, await getMediaByIds(twinMediaIds(casePosts))) : [];
  const people = new Map((members || []).map((m) => [m.id, toPerson(m)]));
  const mediaById = new Map((media || []).map((m) => [m.id, { url: m.source_url, alt: m.alt_text || "" }]));
  // privacy link for the contact-person form consent (Theme options > Footer > privacy links)
  const privacy = (options?.privacy_links?.privacy_links || []).find((l) => /privacy|integritet|personvern|privacidad|vie priv/i.test(l?.title || "") && l.link && l.link !== "#");
  return {
    cases,
    icps: icps || [],
    people,
    mediaById,
    privacyHref: privacy ? langHref(privacy.link, lang) : "",
    // global HubSpot "Get a call" form for this language (Theme options > Footer > Form Shortcode)
    globalQuickForm: parseHubspotEmbed(options?.form_shortcode) ? options.form_shortcode : "",
  };
}

export default async function IcpBuilder({ sections: rawSections, lang = DEFAULT_LANG, currentId }) {
  if (!Array.isArray(rawSections) || rawSections.length === 0) return null;
  const sections = withNeighbours(rawSections); // _prev/_next per block (Figma section-gap rule)
  const { cases, icps, people, mediaById, privacyHref, globalQuickForm } = await prefetch(sections, lang);

  return (
    <>
      {sections.map((raw, i) => {
        // media-ID backgrounds (image field without "Array" return format) → image object
        const block = mediaById.has(Number(raw.bg_image)) ? { ...raw, bg_image: mediaById.get(Number(raw.bg_image)) } : raw;

        // Figma: Steps and the People cards share one section (one gradient, 100px between them)
        const prev = sections[i - 1]?._layout;
        const next = sections[i + 1]?._layout;
        if (block._layout === "switch_steps_section" && next === "team_section") return null; // rendered with the team block below

        switch (block._layout) {
          case "home_hero":
            return <ProductHero key={i} data={block} lang={lang} overlay={HERO_OVERLAY} />;

          case "icp_intro_section":
            return <IcpIntro key={i} data={block} lang={lang} />;

          case "system_check_section":
            return <SystemCheck key={i} data={block} lang={lang} />;

          case "tab_section":
            return <ProductSalesChannels key={i} data={block} lang={lang} defaultCtaVariant="outline" variant="icp" />;

          // "USP Accordion" (usp_accordion in Page Builder ICP Page): same fields as the products
          // layout usp_accordion_section — heading, short_text, cta, items (icon / title / text /
          // link_text / link_url)
          case "usp_accordion":
          case "usp_accordion_section":
            return <ProductUspAccordion key={i} data={block} lang={lang} variant="icp" />;

          // Figma "Comparison block" (Reduce / Improve): same design and fields as the products
          // layout results_section (heading, short_text, columns, bottom_note, bg_image)
          case "result_section":
          case "results_section":
            return <ProductResults key={i} data={block} lang={lang} variant="icp" />;

          case "home_kpi_section":
            return <HomeKpi key={i} data={block} lang={lang} variant="icp" />;

          case "data_insight_section":
            return <HomeDataInsight key={i} data={block} lang={lang} variant="icp" />;

          case "testimonial_slider_section": {
            if (block.slider_type === "fullwidth") {
              const slides = cases
                .filter((c) => c.quote)
                .slice(0, 4)
                .map((c) => ({ quote: c.quote, name: c.personName, company: c.designation, bg_image: c.image }));
              return <ProductTestimonials key={i} data={{ ...block, slides }} lang={lang} />;
            }
            return <IndustryTestimonials key={i} data={block} lang={lang} cases={cases} />;
          }

          case "switch_steps_section":
            return <SwitchSteps key={i} data={block} lang={lang} />;

          case "team_section": {
            const ids = (Array.isArray(block.select_team_member) ? block.select_team_member : [block.select_team_member]).map(postId);
            const list = ids.map((id) => people.get(id)).filter(Boolean);
            if (prev === "switch_steps_section") {
              return (
                <div key={i} style={{ background: SWITCH_GRADIENT }}>
                  <SwitchSteps data={sections[i - 1]} lang={lang} joined />
                  <PeopleCards data={{ ...block, people: list }} lang={lang} joined />
                </div>
              );
            }
            return <PeopleCards key={i} data={{ ...block, people: list }} lang={lang} />;
          }

          case "related_icp": {
            const cards = icps
              .filter((p) => p.id !== currentId)
              .slice(0, 3)
              .map((p) => ({
                title: decode(p.title?.rendered),
                text: decode(p.excerpt?.rendered),
                image: featured(p),
                href: entryHref("icp", p.slug, lang),
                link_text: "Explore",
              }));
            return <StageCards key={i} data={{ ...block, cards }} lang={lang} />;
          }

          case "contact_form_section": {
            // HubSpot form pasted on the page (Shortcode) wins over everything else
            const hubspot = parseHubspotEmbed(block.shortcode) ? block.shortcode : "";
            // Two Figma designs share this layout: contact_person "enable" → "Let's talk bigger
            // picture" with the selected team member (Figma 324:7454); otherwise the "Quick
            // contact" block (eyebrow, heading, text and the form card).
            if (!withContactPerson(block)) {
              // page HubSpot code → the language's global "Get a call" HubSpot form → the page's CF7 form
              const quickForm = hubspot || globalQuickForm;
              return (
                <QuickContact
                  key={i}
                  lang={lang}
                  variant="icp"
                  data={{
                    ...block,
                    sub_heading: block.eyebrow,
                    short_description: block.short_text,
                    background_colour: block.bg_color,
                    form_shortcode: quickForm ? "" : String(postId(block.select_form) || ""),
                  }}
                  form={quickForm ? <HubspotEmbed code={quickForm} /> : undefined}
                />
              );
            }
            const rep = people.get(firstId(block.team_member));
            // Figma form (ContactRepForm) sending to the selected CF7 form; a pasted HubSpot form replaces it
            return (
              <ContactRep
                key={i}
                data={repFormData(block, rep, privacyHref)}
                lang={lang}
                rep={rep ? { name: rep.name, role: rep.role, photo: rep.photo?.url } : undefined}
                form={hubspot ? <HubspotEmbed code={hubspot} variant="rep" /> : undefined}
              />
            );
          }

          default:
            return <ProductBuilder key={i} sections={[block]} lang={lang} />;
        }
      })}
    </>
  );
}
