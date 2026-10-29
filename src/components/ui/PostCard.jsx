// src/components/ui/PostCard.jsx
// Article card from the Figma "Insights" section — image with category label,
// title, read time and "Read more" (the whole card is clickable).
// Used by HomeInsights (3 cards) and NewsListing (paged grid).
// Needs the post with _embedded wp:featuredmedia + wp:term, and content for the read time.
// readMore / readSuffix come from the section's ACF fields; when empty they fall back to
// the per-language labels in lib/postStrings.js.
// slide: the HomeInsights mobile slider card (Figma mobile "Frame 1689", < 768 only): 295px wide,
// the desktop card scaled to 0.73 (radius 11.7, 0.73px border, 161px image, 8.78px Tenon meta,
// 17.55px padding) with the title kept at 26/28. NewsListing / related posts don't pass it.

import Image from "next/image";
import { Inter } from "next/font/google";
import ArrowLink from "@/components/ui/ArrowLink";
import { DEFAULT_LANG, entryHref } from "@/config";
import { readingMinutes } from "@/lib/content";
import { postStrings } from "@/lib/postStrings";

// Figma uses Inter for the small card meta (category + read time)
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

// Mobile-only (max-md:) classes per element for the `slide` variant
const SLIDE = {
  card: "max-md:w-[295px] max-md:shrink-0 max-md:snap-center max-md:rounded-[11.7px] max-md:border-[0.73px] max-md:shadow-none",
  image: "max-md:h-[161px] max-md:p-[14.63px]",
  meta: "max-md:[font-family:var(--font-primary)]! max-md:text-[8.78px] max-md:leading-[12px]",
  category: "max-md:tracking-[0.73px]",
  content: "max-md:gap-[11.7px] max-md:p-[17.55px]",
  title: "max-md:text-[26px]",
  link: "max-md:gap-[5.85px] max-md:text-[11.7px] max-md:leading-[14.63px] max-md:tracking-[-0.234px] max-md:[&_img]:h-auto max-md:[&_img]:w-[11.7px]",
};
const NONE = { card: "", image: "", meta: "", category: "", content: "", title: "", link: "" };

export default function PostCard({ post, readMore, readSuffix, lang = DEFAULT_LANG, slide = false }) {
  const m = slide ? SLIDE : NONE;
  const image = post?._embedded?.["wp:featuredmedia"]?.[0];
  const category = (post?._embedded?.["wp:term"]?.[0] || []).find((t) => t.taxonomy === "category");
  const href = entryHref("post", post.slug, lang);
  const title = post?.title?.rendered || "";
  const strings = postStrings(lang);
  const readMoreText = readMore || strings.readMore;
  const readSuffixText = readSuffix || strings.readSuffix;

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-[16px] border border-(--color-grey-medium) bg-(--color-light-grey) shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 ${m.card}`}>
      <div className={`relative flex h-[220px] items-end overflow-hidden p-5 ${m.image}`}>
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
          <span className={`${inter.className} relative text-[12px] font-bold uppercase tracking-[1px] text-(--color-light-grey) ${m.meta} ${m.category}`}>
            {category.name}
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col items-start gap-4 p-6 ${m.content}`}>
        <h3
          className={`font-bold text-[22px] lg:text-[26px] leading-7 tracking-[-0.52px] normal-case text-black ${m.title}`}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <p className={`${inter.className} text-[12px] text-(--color-grey-medium-dark) ${m.meta}`}>
          {readingMinutes(post?.content?.rendered)} {readSuffixText}
        </p>
        <ArrowLink href={href} className={`mt-auto after:absolute after:inset-0 ${m.link}`}>
          {readMoreText}
        </ArrowLink>
      </div>
    </article>
  );
}
