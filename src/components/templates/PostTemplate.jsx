// src/components/templates/PostTemplate.jsx
// Single article — /artiklar/{slug}, /en/articles/{slug}, /no/artikler/{slug}, /nl/artikelen/{slug} …
// Layout: hero at 70% of the screen height (featured image + dark overlay, category pills,
// read time and the H1 at half the screen width); then the body in a 730px reading column (typography:
// .cs-article in globals.css), a CTA, and related article cards (PostCard).

import Image from "next/image";
import PageBuilder from "@/components/major/PageBuilder";
import CtaButton from "@/components/ui/CtaButton";
import PostCard from "@/components/ui/PostCard";
import Shell from "./Shell";
import { getCategoriesByIds, getMediaById } from "@/lib/api";
import { postStrings } from "@/lib/postStrings";
import { readingMinutes } from "@/lib/content";
import { langHref } from "@/config";

export default async function PostTemplate({ post, lang, slug, themeOptions }) {
  const [featuredMedia, categories] = await Promise.all([
    getMediaById(post.featured_media),
    getCategoriesByIds(post.categories, lang),
  ]);
  // Related posts arrive with image/category embedded (lib/api.js → getPostBySlug)
  const related = Array.isArray(post.relatedPosts) ? post.relatedPosts : [];
  const strings = postStrings(lang);

  const heroImage = featuredMedia?.media_details?.sizes?.full?.source_url || featuredMedia?.source_url || null;
  const sections = post?.acf?.page_builder;
  const hasBuilder = Array.isArray(sections) && sections.length > 0;
  const contentHtml = post?.content?.rendered;
  const cta = themeOptions?.button_text && themeOptions?.button_url ? { text: themeOptions.button_text, url: themeOptions.button_url } : null;

  return (
    <Shell lang={lang} slug={slug} entryType="post" routeType="post" entryId={post?.id} themeOptions={themeOptions}>
      {/* HERO — at least 70% of the screen height (grows for long titles; pt clears the fixed header) */}
      <section className="relative flex min-h-[max(70vh,420px)] items-end overflow-hidden bg-(--color-black) pt-28">
        {heroImage && (
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <span aria-hidden className="absolute inset-0 bg-black/60" />
        <div className="cs-container relative flex flex-col items-start gap-4 lg:gap-6 pb-12 lg:pb-20 text-white">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {categories.map((cat) => (
              <span key={cat.id} className="rounded-full border border-white px-3 py-0.5 text-[16px] font-medium leading-[22px]" dangerouslySetInnerHTML={{ __html: cat.name }} />
            ))}
            {contentHtml && (
              <span className="text-[18px] lg:text-[22px] leading-normal">
                {categories.length > 0 && <span aria-hidden>| </span>}
                {readingMinutes(contentHtml)} {strings.readSuffix}
              </span>
            )}
          </div>
          {/* title takes half the screen width on desktop, full width on mobile */}
          {post?.title?.rendered && (
            <h1 className="cs-h3 w-full lg:w-[50vw] text-white" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
          )}
        </div>
      </section>

      {/* ARTICLE — body in the reading column (title is in the hero) */}
      <article className="cs-container py-14 lg:pt-20 lg:pb-24">
        <div className="mx-auto w-full max-w-[730px]">
          {!hasBuilder && contentHtml && <div className="cs-article" dangerouslySetInnerHTML={{ __html: contentHtml }} />}

          {cta && (
            <CtaButton href={langHref(cta.url, lang)} className="mt-8">
              {cta.text}
            </CtaButton>
          )}
        </div>
      </article>

      {/* ACF flexible content (if a post uses it) renders full width below the title */}
      {hasBuilder && <PageBuilder sections={sections} lang={lang} />}

      {/* RELATED ARTICLES — same cards as the Insights section / news listing */}
      {related.length > 0 && (
        <section className="pt-14 pb-18 lg:pt-24 lg:pb-36 bg-(--color-light-grey)">
          <div className="cs-container flex flex-col gap-10 lg:gap-16">
            <h2 className="cs-h3 text-black">{strings.relatedHeading}</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} readMore={strings.readMore} readSuffix={strings.readSuffix} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Shell>
  );
}
