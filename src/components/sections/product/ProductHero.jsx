// src/components/sections/product/ProductHero.jsx
// ACF layout: home_hero (Page Builder Products) / product_hero — full-height
// image/video with a bottom-aligned H1 (Tenon X-Bold 112/104), intro text, a CTA
// and an optional secondary text link. The header overlays it.
// label (repeater of { label, link }, max 3) — the "One platform / One partner / One login"
// row pinned under the header, as on the homepage hero. Links of "#" render as plain text.

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import HeroLabels from "@/components/ui/HeroLabels";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, toHtml } from "@/lib/content";

export default function ProductHero({ data, lang = DEFAULT_LANG }) {
  const { heading, cta_text, cta_url, secondary_cta_text, secondary_cta_url } = data || {};
  const text = data?.short_heading || data?.short_text;
  if (!heading) return null;

  const bgImage = mediaUrl(data?.bg_image);
  const bgVideo = mediaUrl(data?.bg_video);

  return (
    <section className="relative isolate flex min-h-[640px] w-full items-end overflow-hidden bg-black lg:min-h-[982px]">
      {/* background settles from a slight zoom on load */}
      <Reveal onMount y={0} scale={1.08} duration={1.6} className="absolute inset-0 -z-10">
        {bgVideo ? (
          <video src={bgVideo} poster={bgImage || undefined} autoPlay loop muted playsInline className="size-full object-cover" />
        ) : (
          bgImage && <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
      </Reveal>

      <div className="cs-container flex min-h-[640px] flex-col justify-between gap-16 pt-28 pb-16 lg:min-h-[982px] lg:pt-[148px] lg:pb-36">
        {/* keeps the heading block at the bottom even without labels */}
        <div>
          <HeroLabels labels={data?.label} lang={lang} />
        </div>

        <div className="flex max-w-[850px] flex-col items-start gap-8 lg:gap-12">
          <div className="flex flex-col gap-6 lg:gap-8 text-(--color-light-grey)">
            <Reveal
              as="h1"
              onMount
              y={32}
              duration={0.9}
              className="cs-highlight cs-rich normal-case font-extrabold text-[48px] leading-12 tracking-[-1.92px] md:text-[80px] md:leading-[78px] md:tracking-[-3.2px] xl:text-[112px] xl:leading-[104px] xl:tracking-[-4.48px]"
              dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
            />
            {text && <Reveal onMount delay={0.2} className="cs-p1 cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(text) }} />}
          </div>
          {((cta_text && cta_url) || (secondary_cta_text && secondary_cta_url)) && (
            <Reveal onMount delay={0.4} className="flex flex-wrap items-center gap-6">
              {cta_text && cta_url && <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>}
              {secondary_cta_text && secondary_cta_url && (
                <ArrowLink tone="light" href={langHref(secondary_cta_url.trim(), lang)}>
                  {secondary_cta_text}
                </ArrowLink>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
