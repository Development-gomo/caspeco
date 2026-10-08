// src/components/sections/home/HomeIndustrySlider.jsx
// ACF layout: industry_slider_section — "Pick your industry" card slider.
// Cards come from the "industries" CPT (current language, fetched in PageBuilder):
// title, featured image and permalink. An optional ACF `icon` image on the CPT
// overrides the default fork-and-knife icon from the Figma design.
// Cards run off the right edge (Figma "Card presentation more than 4"); dots page through.

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import DefaultIcon from "../../../../public/icons/home/industry-icon.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, sectionBackground, toHtml } from "@/lib/content";

// CPT entry → card data
function toCard(post) {
  const media = post?._embedded?.["wp:featuredmedia"]?.[0];
  return {
    id: post.id,
    title: post?.title?.rendered || "",
    image: media?.source_url ? { url: media.source_url, alt: media.alt_text || "" } : null,
    icon: post?.acf?.icon || null,
    link_url: post?.slug ? `/industries/${post.slug}` : "",
  };
}

function IndustryCard({ card, lang }) {
  const href = card.link_url ? langHref(card.link_url, lang) : "";
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className="group relative block h-[394px] w-full overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)]"
    >
      {mediaUrl(card.image) && (
        <Image
          src={mediaUrl(card.image)}
          alt={card.image?.alt || ""}
          fill
          sizes="276px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}
      <span
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(145deg, rgba(253,253,253,0.3) 0%, rgba(253,253,253,0) 99.5%), linear-gradient(90deg, rgba(21,20,17,0.3) 0%, rgba(21,20,17,0.3) 100%)",
        }}
      />
      <span className="absolute inset-x-6 top-[139px] flex flex-col items-center gap-[7px] text-center">
        <Image src={mediaUrl(card.icon) || DefaultIcon} alt="" width={64} height={64} className="size-16" />
        {card.title && (
          <span
            className="font-bold text-[26px] leading-[1.1] tracking-[-0.52px] uppercase text-(--color-light-grey)"
            dangerouslySetInnerHTML={{ __html: card.title }}
          />
        )}
      </span>
    </Wrapper>
  );
}

export default function HomeIndustrySlider({ data, lang = DEFAULT_LANG, prefetchedIndustries }) {
  const cards = (Array.isArray(prefetchedIndustries) ? prefetchedIndustries : []).map(toCard).filter((c) => c.title);
  const swiperRef = React.useRef(null);
  const [pages, setPages] = React.useState(1);
  const [active, setActive] = React.useState(0);
  const { heading, short_text, tagline } = data || {};
  if (!heading && cards.length === 0) return null;

  const syncPages = (swiper) => {
    setPages(swiper.snapGrid.length);
    setActive(swiper.snapIndex);
  };

  return (
    <section
      className="overflow-hidden pt-12 pb-18 lg:pt-[72px] lg:pb-36"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.5) 0.94%, #dadcdd 80.71%)",
      })}
    >
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-4">
          {heading && <h2 className="cs-h2 cs-highlight text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}
          {short_text && <p className="cs-p1 max-w-[636px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          {tagline && <p className="text-[14px] lg:text-[16px] font-medium leading-5 tracking-[-0.32px] text-black">{tagline}</p>}
        </div>

        {cards.length > 0 && (
          <div className="flex flex-col items-center gap-8">
            <Swiper
              onSwiper={(s) => {
                swiperRef.current = s;
                syncPages(s);
              }}
              onSnapGridLengthChange={syncPages}
              onSlideChange={(s) => setActive(s.snapIndex)}
              slidesPerView="auto"
              spaceBetween={24}
              breakpoints={{ 1024: { spaceBetween: 48 } }}
              className="w-full !overflow-visible"
            >
              {cards.map((card, i) => (
                <SwiperSlide key={i} className="!w-[276px]">
                  <IndustryCard card={card} lang={lang} />
                </SwiperSlide>
              ))}
            </Swiper>

            {pages > 1 && (
              <div className="flex items-center gap-[9px]">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${i + 1} / ${pages}`}
                    aria-current={active === i}
                    onClick={() => swiperRef.current?.slideTo(i)}
                    className={`cursor-pointer rounded-full transition-all duration-300 ${
                      active === i ? "size-[12.6px] bg-(--color-yellow)" : "size-[7px] bg-white hover:bg-(--color-yellow)/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
