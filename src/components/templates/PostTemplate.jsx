// src/components/templates/PostTemplate.jsx
// Single article — /artiklar/{slug}, /en/articles/{slug}, /no/artikler/{slug}, /nl/artikelen/{slug} …

import Image from "next/image";
import Link from "next/link";
import PageBuilder from "@/components/major/PageBuilder";
import Shell from "./Shell";
import { getMediaById } from "@/lib/api";
import { DEFAULT_LANG, entryHref } from "@/config";

/* ---------------------------------------------------------
   COMPONENT: PostBody
--------------------------------------------------------- */
function PostBody({ entry, lang }) {
  const sections = entry?.acf?.page_builder;
  const contentHtml = entry?.content?.rendered;

  // If ACF flexible content is available → render PageBuilder
  if (Array.isArray(sections) && sections.length > 0) {
    return <PageBuilder sections={sections} lang={lang} />;
  }

  // If WordPress default content exists → show it
  if (contentHtml) {
    return (
      <div
        className="max-w-3xl mx-auto [&>p]:mb-6"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

  // Fallback message
  return (
    <p className="text-center text-gray-500">Content will be available soon.</p>
  );
}

/* ---------------------------------------------------------
   FETCH RELATED MEDIA
--------------------------------------------------------- */
async function fetchRelatedMedia(relatedPosts) {
  return Promise.all(
    relatedPosts.map(async (post) => {
      if (post.featured_media) {
        const media = await getMediaById(post.featured_media);
        return { ...post, featured_media: media };
      }
      return post;
    })
  );
}

export default async function PostTemplate({ post, lang, slug, themeOptions }) {
  // Fetch related media + featured image in parallel
  const [relatedPosts, featuredMedia] = await Promise.all([
    post.relatedPosts ? fetchRelatedMedia(post.relatedPosts) : null,
    getMediaById(post.featured_media),
  ]);
  const related = relatedPosts || post.relatedPosts || [];

  const heroImage =
    featuredMedia?.media_details?.sizes?.full?.source_url ||
    featuredMedia?.source_url ||
    null;

  return (
    <Shell lang={lang} slug={slug} entryType="post" routeType="post" entryId={post?.id} themeOptions={themeOptions}>
      <div className="h-28 w-full bg-black"></div>
      <div className="py-15 md:py-30 web-width px-6">
        <article className="max-w-4xl mx-auto space-y-6">
          {/* TITLE */}
          {post?.title?.rendered && (
            <h1
              className="text-4xl font-semibold text-center"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
          )}
          {/* HERO IMAGE */}
          {heroImage && (
            <div className="relative w-full h-80 rounded-lg overflow-hidden">
              <Image
                src={heroImage}
                alt={post?.title?.rendered || "Post hero image"}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 1024px, 100vw"
                priority
              />
            </div>
          )}
          <div className=" max-w-3xl mx-auto text-[14px] text-[#9192A0]">
            <span>Published on: </span>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          {/* BODY CONTENT (ACF OR WYSIWYG) */}
          <PostBody entry={post} lang={lang} />
          {/* RELATED POSTS */}
          <section className="related-posts">
            <h2 className="content-heading text-center mb-14 mt-14">
              {lang === DEFAULT_LANG ? "Related Posts" : "Flere Nytherer"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.length > 0 ? (
                related.map((relatedPost) => (
                  <article key={relatedPost.id} className="p-4 border rounded-lg">
                    {relatedPost.featured_media?.source_url ? (
                      <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={relatedPost.featured_media.source_url}
                          alt={relatedPost.title?.rendered || "Related post image"}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 1024px, 100vw"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden bg-gray-200">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                    <h3 className="text-xl font-medium mb-4 ">
                      <Link href={entryHref("post", relatedPost.slug, lang)} className="hover:underline">
                        {relatedPost.title?.rendered || "Untitled"}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600">
                      {relatedPost.excerpt?.rendered || "No description available."}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No related posts available.
                </p>
              )}
            </div>
          </section>
        </article>
      </div>
    </Shell>
  );
}
