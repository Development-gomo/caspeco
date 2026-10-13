// src/components/sections/product/ProductHero.jsx
// ACF layout: product_hero — full-height image/video with a bottom-aligned
// H1 (Tenon X-Bold 112/104), intro text and one CTA. The header overlays it.

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, toHtml } from "@/lib/content";

export default function ProductHero({ data, lang = DEFAULT_LANG }) {
  const { heading, short_text, cta_text, cta_url } = data || {};
  if (!heading) return null;

  const bgImage = mediaUrl(data?.bg_image);
  const bgVideo = mediaUrl(data?.bg_video);

  return (
    <section className="relative isolate flex min-h-[640px] w-full items-end overflow-hidden bg-(--color-black) lg:min-h-[982px]">
      {bgVideo ? (
        <video src={bgVideo} poster={bgImage || undefined} autoPlay loop muted playsInline className="absolute inset-0 -z-10 size-full object-cover" />
      ) : (
        bgImage && <Image src={bgImage} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      )}

      <div className="cs-container pt-36 pb-16 lg:pt-[148px] lg:pb-36">
        <div className="flex max-w-[850px] flex-col items-start gap-8 lg:gap-12">
          <div className="flex flex-col gap-6 lg:gap-8 text-(--color-light-grey)">
            <h1
              className="cs-highlight normal-case font-extrabold text-[48px] leading-12 tracking-[-1.92px] md:text-[80px] md:leading-[78px] md:tracking-[-3.2px] xl:text-[112px] xl:leading-[104px] xl:tracking-[-4.48px]"
              dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
            />
            {short_text && <div className="cs-p1 cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>
          {cta_text && cta_url && <CtaButton href={langHref(cta_url.trim(), lang)}>{cta_text}</CtaButton>}
        </div>
      </div>
    </section>
  );
}
