// src/components/sections/inner-pages/NewsListing.jsx
// ACF layout: news_listing — all posts (news/articles) as Insights cards, 9 per page.
// The first page is rendered on the server (PageBuilder → getPostsPage); "Load more"
// fetches the next page in the browser via the /api/content proxy and appends it.
// Section fields (all optional): heading, short_text, read_more_text, read_time_suffix,
//   load_more_text.

"use client";

import React from "react";
import CtaButton from "@/components/ui/CtaButton";
import PostCard from "@/components/ui/PostCard";
import { DEFAULT_LANG } from "@/config";
import { sectionBackground, toHtml } from "@/lib/content";
import { postsPageQuery } from "@/lib/postsQuery";

const DEFAULT_TEXT = { read_more_text: "Read more", load_more_text: "Load more" };
const text = (data, key) => (typeof data?.[key] === "string" && data[key].trim()) || DEFAULT_TEXT[key];

export default function NewsListing({ data, lang = DEFAULT_LANG, initial }) {
  const [posts, setPosts] = React.useState(Array.isArray(initial?.posts) ? initial.posts : []);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(initial?.totalPages || 1);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const { heading, short_text, read_time_suffix } = data || {};
  if (!heading && posts.length === 0) return null;

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const next = page + 1;
      const res = await fetch(`/api/content${postsPageQuery(lang, next)}`);
      if (!res.ok) throw new Error(String(res.status));
      const more = await res.json();
      if (!Array.isArray(more)) throw new Error("bad response");
      // skip anything already shown (a post published between pages shifts the offsets)
      setPosts((cur) => [...cur, ...more.filter((p) => !cur.some((c) => c.id === p.id))]);
      setPage(next);
      const pages = Number(res.headers.get("x-wp-totalpages"));
      if (pages) setTotalPages(pages);
      else if (more.length === 0) setTotalPages(next - 1);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-18 lg:py-36" style={sectionBackground(data, { background: "var(--color-light-grey)" })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {(heading || short_text) && (
          <div className="flex flex-col items-start gap-6">
            {heading && <h2 className="cs-h2 cs-highlight max-w-[985px] text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
            {short_text && <div className="cs-p1 cs-rich max-w-[680px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} readMore={text(data, "read_more_text")} readSuffix={read_time_suffix} lang={lang} />
            ))}
          </div>
        )}

        {page < totalPages && (
          <div className="flex flex-col items-center gap-3">
            <CtaButton variant="outline-dark" onClick={loadMore} disabled={loading} aria-busy={loading} className="disabled:cursor-wait disabled:opacity-60">
              {text(data, "load_more_text")}
            </CtaButton>
            {failed && <p className="text-[14px] text-(--color-grey-dark)">Couldn&apos;t load more posts. Please try again.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
