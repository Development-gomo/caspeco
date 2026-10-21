// src/lib/postsQuery.js
// One page of posts for card grids (NewsListing). Shared by the server's first page
// (lib/api.js → getPostsPage) and the browser's "Load more" (/api/content proxy), so
// both request exactly the same fields. Content is included for the read time.

export const POSTS_PER_PAGE = 9;

export function postsPageQuery(lang, page = 1, perPage = POSTS_PER_PAGE) {
  return (
    `/wp/v2/posts?lang=${encodeURIComponent(lang)}&per_page=${perPage}&page=${page}` +
    `&orderby=date&order=desc&_embed=wp:featuredmedia,wp:term` +
    `&_fields=id,slug,date,title,content,_links,_embedded`
  );
}
