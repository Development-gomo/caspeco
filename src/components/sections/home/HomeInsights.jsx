// src/components/sections/home/HomeInsights.jsx
// ACF layout: insights_section — "Insights for a more profitable hospitality business".
// Shows 3 posts: hand-picked via the optional `posts` relationship, else the latest.
// Category label = first post category; read time is calculated from the post body.
// Card: components/ui/PostCard.jsx (shared with NewsListing).
// Mobile (< 768, Figma "Frame 1689"): centred swipe slider, 295px cards 23.4 apart (PostCard
// `slide` = the Figma mobile card sizes), graded dots 40 below, section padding 64 / 32.

"use client";

import React from "react";
import CtaButton from "@/components/ui/CtaButton";
import PostCard from "@/components/ui/PostCard";
import { MOBILE_TRACK, SliderPoints } from "@/components/ui/MobileSlider";
import { DEFAULT_LANG, langHref } from "@/config";
import { rows, sectionBackground, toHtml } from "@/lib/content";

export default function HomeInsights({ data, lang = DEFAULT_LANG, prefetchedPosts }) {
  const pool = Array.isArray(prefetchedPosts) ? prefetchedPosts : [];
  const picked = rows(data?.posts).map((p) => (typeof p === "object" ? p.ID || p.id : p));
  const posts = (picked.length ? picked.map((id) => pool.find((p) => p.id === id)).filter(Boolean) : pool).slice(0, 3);

  const { heading, short_text, cta_text, cta_url, read_more_text, read_time_suffix } = data || {};
  const trackRef = React.useRef(null);
  if (!heading && posts.length === 0) return null;

  return (
    <section className="cs-sec py-18 lg:py-36 max-md:[--sec-pb:32px]" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          {heading && <h2 className="cs-h2 cs-highlight max-w-[985px] text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <div className="cs-p1 cs-rich max-w-[680px] text-(--color-grey-dark) max-md:font-normal!" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {cta_text && cta_url && (
            <CtaButton variant="outline-dark-grey" href={langHref(cta_url.trim(), lang)} className="mt-4 max-md:mt-0">
              {cta_text}
            </CtaButton>
          )}
        </div>

        {posts.length > 0 && (
          <div
            ref={trackRef}
            className={`grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 ${MOBILE_TRACK} max-md:-mx-6 max-md:gap-[23.4px] max-md:px-[49px]`}
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} readMore={read_more_text} readSuffix={read_time_suffix} lang={lang} slide />
            ))}
          </div>
        )}
        {posts.length > 1 && <SliderPoints trackRef={trackRef} count={posts.length} align="center" />}
      </div>
    </section>
  );
}
