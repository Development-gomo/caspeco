// src/components/ui/PostCard.jsx
// Article card from the Figma "Insights" section — image with category label,
// title, read time and "Read more" (the whole card is clickable).
// Used by HomeInsights (3 cards) and NewsListing (paged grid).
// Needs the post with _embedded wp:featuredmedia + wp:term, and content for the read time.

import Image from "next/image";
import { Inter } from "next/font/google";
import ArrowLink from "@/components/ui/ArrowLink";
import { DEFAULT_LANG, entryHref } from "@/config";
import { readingMinutes } from "@/lib/content";

// Figma uses Inter for the small card meta (category + read time)
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

export default function PostCard({ post, readMore, readSuffix, lang = DEFAULT_LANG }) {
  const image = post?._embedded?.["wp:featuredmedia"]?.[0];
  const category = (post?._embedded?.["wp:term"]?.[0] || []).find((t) => t.taxonomy === "category");
  const href = entryHref("post", post.slug, lang);
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
          className="font-bold text-[22px] lg:text-[26px] leading-7 tracking-[-0.52px] normal-case text-black"
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
