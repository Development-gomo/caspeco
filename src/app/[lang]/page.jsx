//src/app/[lang]/page.jsx

import Header from "@/components/major/Header";
import PageBuilder from "@/components/major/PageBuilder";
import Footer from "@/components/major/Footer";
import { getPageBySlug, getThemeOptions } from "@/lib/api";
import { buildMetadataFromYoast } from "@/lib/seo";
import { resolveParams } from "@/lib/params";
import { notFound } from "next/navigation";
import { altLangUrls } from "@/lib/translations";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHome } from "@/config";

export const revalidate = 300;

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function LangHomePage({ params }) {
  const resolvedParams = resolveParams(await params);
  const lang = resolvedParams.lang || DEFAULT_LANG;

  // Fetch page + header/footer data in parallel (single round-trip)
  const [page, themeOptions] = await Promise.all([
    getPageBySlug("frontpage", lang),
    getThemeOptions(lang),
  ]);

  if (!page) notFound();

  return (
    <>
      <Header
        lang={lang}
        altLangUrls={altLangUrls(lang)}
        prefetchedOptions={themeOptions || {}}
        logoUrl={themeOptions?.logo_light?.url || ""}
      />
      <main id="home">
        <PageBuilder sections={page?.acf?.page_builder} lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = resolveParams(await params);
  const page = await getPageBySlug("frontpage", resolvedParams.lang);
  return buildMetadataFromYoast(page, {
    lang: resolvedParams.lang,
    path: page ? langHome(resolvedParams.lang) : undefined,
  });
}
