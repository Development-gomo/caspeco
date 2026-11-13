// src/components/sections/product/ProductRelated.jsx
// ACF layout: related_product_section — 4 product cards (featured image, title, excerpt, link to the
// product page). Uses the products picked in "related_products"; when none are picked it falls back to
// the other products. The link text comes from the section's "explore_text" field.
// Rendering is delegated to HomeProductCards so the cards look exactly like the product card section.

import HomeProductCards from "../home/HomeProductCards";
import { getAllProducts, getProductsByIds } from "@/lib/api";
import { DEFAULT_LANG, entryHref } from "@/config";
import { rows } from "@/lib/content";

const MAX_CARDS = 4;

const stripTags = (html = "") => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&#8217;/g, "’").replace(/&amp;/g, "&").trim();

// HomeProductCards runs the link through langHref(), so hand it the path without the language prefix
function unprefixed(href, lang) {
  return lang !== DEFAULT_LANG && href.startsWith(`/${lang}/`) ? href.slice(lang.length + 1) : href;
}

export default async function ProductRelated({ data, lang = DEFAULT_LANG, currentId = null }) {
  const selectedIds = rows(data?.related_products)
    .map((p) => (typeof p === "object" ? p.ID ?? p.id : p))
    .map(Number)
    .filter((id) => id > 0 && id !== Number(currentId));

  let products = selectedIds.length ? await getProductsByIds(selectedIds, lang) : [];
  if (!products.length) {
    const all = await getAllProducts(lang);
    products = (Array.isArray(all) ? all : []).filter((p) => p.id !== Number(currentId));
  }

  const cards = products.slice(0, MAX_CARDS).map((p) => {
    const media = p?._embedded?.["wp:featuredmedia"]?.[0];
    return {
      image: media?.source_url ? { url: media.source_url, alt: media.alt_text || "" } : null,
      title: stripTags(p.title?.rendered),
      text: stripTags(p.excerpt?.rendered),
      cta_text: data?.explore_text || "Explore",
      cta_url: unprefixed(entryHref("product", p.slug, lang), lang),
    };
  });

  if (!cards.length) return null;
  return <HomeProductCards data={{ ...data, tagline: "", cards }} lang={lang} />;
}
