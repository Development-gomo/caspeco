// src/app/[lang]/[slug]/page.jsx

import { getPageBySlug, fetchWP, getThemeOptions, getTranslationMap } from "@/lib/api";
import { resolveParams } from "@/lib/params";
import PageBuilder from "@/components/major/PageBuilder";
import Header from "@/components/major/Header";
import Footer from "@/components/major/Footer";
import { buildMetadataFromYoast } from "@/lib/seo";
import { notFound } from "next/navigation";
import { altLangUrls } from "@/lib/translations";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHref, langHome } from "@/config";

export const revalidate = 300;

export async function generateStaticParams() {
  const results = await Promise.all(
    SUPPORTED_LANGS.map((lang) => fetchWP(`/wp/v2/pages?per_page=100&lang=${lang}`))
  );
  return SUPPORTED_LANGS.flatMap((lang, i) =>
    (Array.isArray(results[i]) ? results[i] : []).map((p) => ({ lang, slug: p.slug }))
  );
}

const FORM_LAYOUTS = new Set(["contact_form_section", "quick_contact_section"]);
const hasPageForm = (sections) => Array.isArray(sections) && sections.some((b) => FORM_LAYOUTS.has(b?._layout));

export default async function SinglePage({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);

  const lang = parsed?.lang || DEFAULT_LANG;
  const slug = parsed?.slug;

  if (!SUPPORTED_LANGS.includes(lang)) notFound();
  if (!slug) notFound();

  const [data, themeOptions] = await Promise.all([
    getPageBySlug(slug, lang),
    getThemeOptions(lang),
  ]);

  // child pages only live under their parent's path ([lang]/[slug]/[...rest])
  if (!data || data.parent) notFound();
  const acf = data?.acf || {};
  const map = await getTranslationMap(data.id, lang);

  return (
    <>
      <Header
        lang={lang}
        altLangUrls={altLangUrls(lang, { map, linkEntry: true })}
        prefetchedOptions={themeOptions || {}}
        logoUrl={themeOptions?.logo_light?.url || ""}
      />
      <main>
        <PageBuilder sections={acf.page_builder} lang={lang} />
      </main>
      {/* the footer Quick contact would repeat the page's own form */}
      <Footer lang={lang} currentSlug={slug} hideQuickContact={hasPageForm(acf.page_builder)} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const parsed = resolveParams(resolved);
  const lang = parsed?.lang || DEFAULT_LANG;
  if (!SUPPORTED_LANGS.includes(lang)) return buildMetadataFromYoast(null, { fallbackTitle: "Caspeco", lang: DEFAULT_LANG });
  const slug = parsed?.slug;
  const data = await getPageBySlug(slug, lang);
  // child pages 404 here (they live under their parent), so they get no canonical/robots
  const indexable = data && !data.parent ? data : null;
  return buildMetadataFromYoast(indexable, {
    fallbackTitle: "Caspeco",
    lang,
    path: indexable
      ? indexable.slug === "frontpage" ? langHome(lang) : langHref(`/${indexable.slug}`, lang)
      : undefined,
  });
}