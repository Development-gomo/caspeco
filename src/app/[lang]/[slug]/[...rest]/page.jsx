// src/app/[lang]/[slug]/[...rest]/page.jsx
// Every URL with 2+ segments after the language, matching the live caspeco.com structure:
//   /{base}/{slug}  → single entry; the base is localized per language (see ROUTE_TYPES
//                     in src/config): /artiklar/x, /en/articles/x, /case/x, /en/product/x …
//   anything else   → child page by its full path, e.g. /nl/nieuws/blackbox-gks-2-0
// A base that is also a page slug (/fr/articles/) still works: one segment is handled
// by [lang]/[slug], and an unknown entry under a base falls back to a child page.

import { cache } from "react";
import { notFound } from "next/navigation";
import {
  getPostBySlug,
  getCaseStudyBySlug,
  getProductBySlug,
  getIndustryBySlug,
  getPartnerBySlug,
  getPartnerCategoryBySlug,
  getPartnersByCategory,
  getPageByPath,
  getThemeOptions,
  fetchWP,
  getCaseStudies,
} from "@/lib/api";
import { resolveParams } from "@/lib/params";
import { buildMetadataFromYoast } from "@/lib/seo";
import { DEFAULT_LANG, SUPPORTED_LANGS, ROUTE_TYPES, typeFromBase } from "@/config";
import PostTemplate from "@/components/templates/PostTemplate";
import CaseStudyTemplate from "@/components/templates/CaseStudyTemplate";
import EntryTemplate from "@/components/templates/EntryTemplate";
import ProductTemplate from "@/components/templates/ProductTemplate";
import PartnerCategoryTemplate from "@/components/templates/PartnerCategoryTemplate";

export const revalidate = 300;

// Pre-render articles and case studies; other entries render on first request (then cached)
export async function generateStaticParams() {
  const [posts, cases] = await Promise.all([
    Promise.all(SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/posts?per_page=100&lang=${lang}&_fields=slug`))),
    Promise.all(SUPPORTED_LANGS.map((lang) => getCaseStudies(lang))),
  ]);
  const params = (type, lists) =>
    SUPPORTED_LANGS.flatMap((lang, i) =>
      (Array.isArray(lists[i]) ? lists[i] : []).map((e) => ({ lang, slug: ROUTE_TYPES[type].base[lang], rest: [e.slug] }))
    );
  return [...params("post", posts), ...params("casestudy", cases)];
}

// Shared by the page and generateMetadata (fetches are deduped by fetchWP as well)
const resolveRoute = cache(async (lang, segments) => {
  const [base, slug] = segments;
  const type = segments.length === 2 ? typeFromBase(base, lang) : null;

  if (type === "post") {
    const post = await getPostBySlug(slug, lang);
    if (post) return { type, entry: post, slug };
  }
  if (type === "casestudy") {
    const caseStudy = await getCaseStudyBySlug(slug, lang);
    if (caseStudy) return { type, entry: caseStudy, slug };
  }
  if (type === "product") {
    const product = await getProductBySlug(slug, lang);
    if (product) return { type, entry: product, slug };
  }
  if (type === "industry") {
    const industry = await getIndustryBySlug(slug, lang);
    if (industry) return { type, entry: industry, slug };
  }
  if (type === "partner") {
    const partner = await getPartnerBySlug(slug, lang);
    if (partner) return { type, entry: partner, slug };
  }
  if (type === "partnerCategory") {
    const term = await getPartnerCategoryBySlug(slug, lang);
    if (term) return { type, entry: term, slug, partners: await getPartnersByCategory(term.id, lang) };
  }

  const page = await getPageByPath(segments, lang);
  if (page) return { type: "page", entry: page, slug: segments.at(-1) };

  return null;
});

async function routeFromParams(params) {
  const parsed = resolveParams(await params);
  const lang = parsed?.lang || DEFAULT_LANG;
  const rest = Array.isArray(parsed?.rest) ? parsed.rest : [parsed?.rest].filter(Boolean);
  const segments = [parsed?.slug, ...rest].filter(Boolean).map((s) => decodeURIComponent(s));
  if (segments.length < 2) return { lang, route: null };
  return { lang, route: await resolveRoute(lang, segments) };
}

export default async function LocalizedEntryPage({ params }) {
  const { lang, route } = await routeFromParams(params);
  if (!route) notFound();

  const themeOptions = await getThemeOptions(lang);
  const common = { lang, slug: route.slug, themeOptions };

  switch (route.type) {
    case "post":
      return <PostTemplate post={route.entry} {...common} />;
    case "casestudy":
      return <CaseStudyTemplate caseStudy={route.entry} {...common} />;
    case "product":
      return <ProductTemplate product={route.entry} {...common} />;
    case "industry":
      return <EntryTemplate entry={route.entry} entryType="industries" routeType="industry" {...common} />;
    case "partner":
      return <EntryTemplate entry={route.entry} entryType="partner" routeType="partner" {...common} />;
    case "partnerCategory":
      return <PartnerCategoryTemplate term={route.entry} partners={route.partners} {...common} />;
    default:
      // child page: parent slugs differ per language, so the switcher falls back to the homepages
      return <EntryTemplate entry={route.entry} entryType="pages" linkTranslations={false} {...common} />;
  }
}

export async function generateMetadata({ params }) {
  const { lang, route } = await routeFromParams(params);
  return buildMetadataFromYoast(route?.entry, {
    fallbackTitle: route?.entry?.name || "Caspeco",
    lang,
  });
}
