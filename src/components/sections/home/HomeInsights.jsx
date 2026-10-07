// src/components/sections/home/HomeInsights.jsx
// ACF layout: insights_section — "Insights for a more profitable hospitality business".
// Shows 3 posts: hand-picked via the optional `posts` relationship, else the latest.
// Category label = first post category; read time is calculated from the post body.

import Image from "next/image";
import { Inter } from "next/font/google";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import { DEFAULT_LANG, langHref } from "@/config";
import { readingMinutes, rows, sectionBackground, toHtml } from "@/lib/content";

// Figma uses Inter for the small card meta (category + read time)
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

function InsightCard({ post, readMore, readSuffix, lang }) {
  const image = post?._embedded?.["wp:featuredmedia"]?.[0];
  const category = (post?._embedded?.["wp:term"]?.[0] || []).find((t) => t.taxonomy === "category");
  const href = langHref(`/post/${post.slug}`, lang);
  const title = post?.title?.rendered || "";

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[16px] border border-(--color-grey-medium) bg-(--color-light-grey) shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1">
      <div className="relative flex h-[220px] items-end p-5">
        {image?.source_url && (
          <Image
            src={image.source_url}
            alt={image.alt_text || ""}
            fill
            sizes="(min-width: 1024px) 403px, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.7)_100%)]" />
        {category?.name && (
          <span className={`${inter.className} relative text-[12px] font-bold uppercase tracking-[1px] text-(--color-light-grey)`}>
            {category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-start gap-4 p-6">
        <h3
          className="font-bold text-[22px] lg:text-[26px] leading-7 tracking-[-0.52px] normal-case text-(--color-black)"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {readSuffix && (
          <p className={`${inter.className} text-[12px] text-(--color-grey-medium-dark)`}>
            {readingMinutes(post?.content?.rendered)} {readSuffix}
          </p>
        )}
        {readMore && (
          <ArrowLink href={href} className="mt-auto after:absolute after:inset-0">
            {readMore}
          </ArrowLink>
        )}
      </div>
    </article>
  );
}

export default function HomeInsights({ data, lang = DEFAULT_LANG, prefetchedPosts }) {
  const pool = Array.isArray(prefetchedPosts) ? prefetchedPosts : [];
  const picked = rows(data?.posts).map((p) => (typeof p === "object" ? p.ID || p.id : p));
  const posts = (picked.length ? picked.map((id) => pool.find((p) => p.id === id)).filter(Boolean) : pool).slice(0, 3);

  const { heading, short_text, cta_text, cta_url, read_more_text, read_time_suffix } = data || {};
  if (!heading && posts.length === 0) return null;

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          {heading && <h2 className="cs-h2 cs-highlight max-w-[985px] text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <p className="cs-p1 max-w-[680px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {cta_text && cta_url && (
            <CtaButton variant="outline-dark" href={langHref(cta_url.trim(), lang)} className="mt-4">
              {cta_text}
            </CtaButton>
          )}
        </div>

        {posts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <InsightCard key={post.id} post={post} readMore={read_more_text} readSuffix={read_time_suffix} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
