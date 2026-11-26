// src/app/[lang]/[slug]/[...rest]/page.jsx
// Every URL with 2+ segments after the language, matching the live caspeco.com structure:
//   /{base}/{slug}  → single entry; the base is localized per language (see ROUTE_TYPES
//                     in src/config): /artiklar/x, /en/articles/x, /case/x, /en/product/x …
//   anything else   → child page by its full path, e.g. /nl/nieuws/blackbox-gks-2-0
// A base that is also a page slug (/fr/articles/) still works: one segment is handled
// by [lang]/[slug], and an unknown entry under a base falls back to a child page.

import { cache } from "react";
import { notFound } from "next/navigation";
import NotFoundView from "@/components/ui/NotFoundView";
import {
  getPostBySlug,
  getCaseStudyBySlug,
  getProductBySlug,
  getIndustryBySlug,
  getIcpBySlug,
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
import { DEFAULT_LANG, SUPPORTED_LANGS, ROUTE_TYPES, BODY_CLASS, typeFromBase, entryHref, langHref } from "@/config";
import PageType from "@/components/ui/PageType";
import PostTemplate from "@/components/templates/PostTemplate";
import CaseStudyTemplate from "@/components/templates/CaseStudyTemplate";
import EntryTemplate from "@/components/templates/EntryTemplate";
import ProductTemplate from "@/components/templates/ProductTemplate";
import IndustryTemplate from "@/components/templates/IndustryTemplate";
import IcpTemplate from "@/components/templates/IcpTemplate";
import PartnerTemplate from "@/components/templates/PartnerTemplate";
import PartnerCategoryTemplate from "@/components/templates/PartnerCategoryTemplate";

export const revalidate = 300;

// Pre-render every single-entry page (articles, case studies, products, industries, solutions, partners, partner
// categories) so the first visitor never waits for a server render; new entries render on first request (then cached)
const PRERENDER_TYPES = ["post", "product", "industry", "icp", "partner", "partnerCategory"];
export async function generateStaticParams() {
  const [cases, ...lists] = await Promise.all([
    Promise.all(SUPPORTED_LANGS.map((lang) => getCaseStudies(lang))),
    ...PRERENDER_TYPES.map((type) =>
      Promise.all(SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/${ROUTE_TYPES[type].rest}?per_page=100&lang=${lang}&_fields=slug`)))
    ),
  ]);
  const params = (type, byLang) =>
    SUPPORTED_LANGS.flatMap((lang, i) =>
      (Array.isArray(byLang[i]) ? byLang[i] : []).map((e) => ({ lang, slug: ROUTE_TYPES[type].base[lang], rest: [e.slug] }))
    );
  return [params("casestudy", cases), ...PRERENDER_TYPES.map((type, i) => params(type, lists[i]))].flat();
}

// Shared by the page and generateMetadata (fetches are deduped by fetchWP as well)
// Keyed on a string: React's cache() compares arguments by identity, so an array would never hit.
const resolveRoute = cache(async (lang, key) => {
  const segments = JSON.parse(key);
  const [base, slug] = segments;
  const type = segments.length === 2 ? typeFromBase(base, lang) : null;

  // `path` = canonical local URL, built from the entry's own slug (not the requested URL)
  if (type === "post") {
    const post = await getPostBySlug(slug, lang);
    if (post) return { type, entry: post, slug, path: entryHref(type, post.slug, lang) };
  }
  if (type === "casestudy") {
    const caseStudy = await getCaseStudyBySlug(slug, lang);
    if (caseStudy) return { type, entry: caseStudy, slug, path: entryHref(type, caseStudy.slug, lang) };
  }
  if (type === "product") {
    const product = await getProductBySlug(slug, lang);
    if (product) return { type, entry: product, slug, path: entryHref(type, product.slug, lang) };
  }
  if (type === "industry") {
    const industry = await getIndustryBySlug(slug, lang);
    if (industry) return { type, entry: industry, slug, path: entryHref(type, industry.slug, lang) };
  }
  if (type === "icp") {
    const icp = await getIcpBySlug(slug, lang);
    if (icp) return { type, entry: icp, slug, path: entryHref(type, icp.slug, lang) };
  }
  if (type === "partner") {
    const partner = await getPartnerBySlug(slug, lang);
    if (partner) return { type, entry: partner, slug, path: entryHref(type, partner.slug, lang) };
  }
  if (type === "partnerCategory") {
    const term = await getPartnerCategoryBySlug(slug, lang);
    if (term) {
      return {
        type,
        entry: term,
        slug,
        path: entryHref(type, term.slug, lang),
        partners: await getPartnersByCategory(term.id, lang),
      };
    }
  }

  const page = await getPageByPath(segments, lang);
  if (page) {
    return {
      type: "page",
      entry: page,
      slug: segments.at(-1),
      path: langHref("/" + [...segments.slice(0, -1), page.slug].join("/"), lang),
    };
  }

  return null;
});

// null on a malformed %-escape (decodeURIComponent throws) -> treated as an unknown URL
function decodeSegments(list) {
  try {
    return list.map((s) => decodeURIComponent(s));
  } catch {
    return null;
  }
}

async function segmentsFromParams(params) {
  const parsed = resolveParams(await params);
  const lang = parsed?.lang || DEFAULT_LANG;
  if (!SUPPORTED_LANGS.includes(lang)) return { lang: DEFAULT_LANG, segments: null };
  const rest = Array.isArray(parsed?.rest) ? parsed.rest : [parsed?.rest].filter(Boolean);
  return { lang, segments: decodeSegments([parsed?.slug, ...rest].filter(Boolean)) };
}

const lookup = (lang, segments) => (!segments || segments.length < 2 ? null : resolveRoute(lang, JSON.stringify(segments)));

async function routeFromParams(params) {
  const { lang, segments } = await segmentsFromParams(params);
  return { lang, route: await lookup(lang, segments) };
}

function renderRoute(route, common) {
  switch (route.type) {
    case "post":
      return <PostTemplate post={route.entry} {...common} />;
    case "casestudy":
      return <CaseStudyTemplate caseStudy={route.entry} {...common} />;
    case "product":
      return <ProductTemplate product={route.entry} {...common} />;
    case "industry":
      return <IndustryTemplate industry={route.entry} {...common} />;
    case "icp":
      return <IcpTemplate icp={route.entry} {...common} />;
    case "partner":
      return <PartnerTemplate entry={route.entry} {...common} />;
    case "partnerCategory":
      return <PartnerCategoryTemplate term={route.entry} partners={route.partners} {...common} />;
    default:
      // child page: parent slugs differ per language, so the switcher falls back to the homepages
      return <EntryTemplate entry={route.entry} entryType="pages" linkTranslations={false} {...common} />;
  }
}

export default async function LocalizedEntryPage({ params }) {
  const { lang, segments } = await segmentsFromParams(params);
  if (!segments) notFound(); // unknown language prefix: the client not-found page handles it
  // header/footer options only depend on the language: fetch them alongside the route (never rejects)
  const themeOptionsPromise = getThemeOptions(lang);
  const route = await lookup(lang, segments);
  const themeOptions = await themeOptionsPromise;
  if (!route) return <NotFoundView lang={lang} themeOptions={themeOptions} />;

  const common = { lang, slug: route.slug, themeOptions };

  // the page-type class (article, product, partner …) used to be the <body> class
  return <PageType type={BODY_CLASS[route.type] || "page"}>{renderRoute(route, common)}</PageType>;
}

export async function generateMetadata({ params }) {
  const { lang, route } = await routeFromParams(params);
  // missing entry: the page renders the 404 view with HTTP 200, so it must say noindex itself
  if (!route) return { ...buildMetadataFromYoast(null, { fallbackTitle: "Caspeco", lang }), robots: { index: false, follow: false } };
  return buildMetadataFromYoast(route?.entry, {
    fallbackTitle: route?.entry?.name || "Caspeco",
    lang,
    path: route?.path,
  });
}
