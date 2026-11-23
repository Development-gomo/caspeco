// src/components/sections/product/DynamicProductCards.jsx
// ACF layout: dynamic_product_card_section ("Dynamic Product card Section", Industry pages).
// Fields: heading, short_text, cta_text + cta_url (outline button under the intro, needs both), read_more_text (card link,
// default "Explore"), select_products (products CPT, up to 4 — empty: the latest 4), bg_image / bg_color, padding_*.
// Cards are the products' featured image, title, excerpt and a link to the product page; rendering is delegated to
// HomeProductCards so they look exactly like the Product Cards section.

import HomeProductCards from "../home/HomeProductCards";
import { getAllProducts, getProductsByIds } from "@/lib/api";
import { DEFAULT_LANG, entryHref } from "@/config";
import { rows } from "@/lib/content";
import { postStrings } from "@/lib/postStrings";

const MAX_CARDS = 4;

const stripTags = (html = "") => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&#8217;/g, "’").replace(/&amp;/g, "&").trim();

// HomeProductCards runs the link through langHref(), so hand it the path without the language prefix
function unprefixed(href, lang) {
  return lang !== DEFAULT_LANG && href.startsWith(`/${lang}/`) ? href.slice(lang.length + 1) : href;
}

export default async function DynamicProductCards({ data, lang = DEFAULT_LANG, currentId = null }) {
  // select_products arrives as post IDs or ACF post objects, in the order the editor picked them
  const selectedIds = rows(data?.select_products)
    .map((p) => (typeof p === "object" ? p.ID ?? p.id : p))
    .map(Number)
    .filter((id) => id > 0 && id !== Number(currentId));

  let products = selectedIds.length ? await getProductsByIds(selectedIds, lang) : [];
  if (!products.length) {
    const all = await getAllProducts(lang);
    products = (Array.isArray(all) ? all : []).filter((p) => p.id !== Number(currentId));
  }

  const readMore = typeof data?.read_more_text === "string" && data.read_more_text.trim() ? data.read_more_text.trim() : postStrings(lang).explore;
  const cards = products.slice(0, MAX_CARDS).map((p) => {
    const media = p?._embedded?.["wp:featuredmedia"]?.[0];
    return {
      image: media?.source_url ? { url: media.source_url, alt: media.alt_text || "" } : null,
      title: stripTags(p.title?.rendered),
      text: stripTags(p.excerpt?.rendered),
      cta_text: readMore,
      cta_url: unprefixed(entryHref("product", p.slug, lang), lang),
    };
  });

  if (!cards.length) return null;
  const ctaText = typeof data?.cta_text === "string" ? data.cta_text.trim() : "";
  const ctaHref = typeof data?.cta_url === "string" ? data.cta_url.trim() : "";
  return (
    <HomeProductCards
      data={{ ...data, tagline: "", cards }}
      lang={lang}
      mobileBleed
      cta={ctaText && ctaHref ? { text: ctaText, href: ctaHref } : null}
    />
  );
}
