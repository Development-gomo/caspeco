// src/components/sections/home/HomeIntegrations.jsx
// ACF layout: integrations_section — "100+ integrations" with a three-row logo wall.
// Rows 1 and 3 are static; the middle row scrolls (Figma "Middle row/Variant3").
// Logos from the gallery are reused in order if there are fewer than the wall needs.

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, langHref } from "@/config";
import { highlightHtml, mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const OUTER_ROW = 6;
const MIDDLE_ROW = 7;

const ROW_TILE = {
  top: "linear-gradient(228.7deg, rgba(255,255,255,0) 42.2%, rgba(255,255,255,0.2) 95.3%), linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 100%)",
  middle: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 100%)",
  bottom: "linear-gradient(223.6deg, rgba(255,255,255,0.2) 2.8%, rgba(255,255,255,0) 94.3%), linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 100%)",
};

function Tile({ logo, variant }) {
  const big = variant === "middle";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[12px] ${big ? "size-[80px] lg:size-[107px]" : "size-[66px] lg:size-[88px]"}`}
      style={{ backgroundImage: ROW_TILE[variant] }}
    >
      <div className={`relative overflow-hidden rounded-[10px] bg-white ${big ? "size-[54px] lg:size-[72px]" : "size-[45px] lg:size-[60px]"}`}>
        <Image src={mediaUrl(logo)} alt={logo.alt || logo.title || ""} fill sizes="72px" className="object-contain p-1.5" />
      </div>
    </div>
  );
}

const take = (list, start, count) => Array.from({ length: count }, (_, i) => list[(start + i) % list.length]);

export default function HomeIntegrations({ data, lang = DEFAULT_LANG }) {
  const logos = rows(data?.logos).filter((l) => mediaUrl(l));
  const { heading, short_text, cta_text, cta_url } = data || {};
  if (!heading && logos.length === 0) return null;

  const top = logos.length ? take(logos, 0, OUTER_ROW) : [];
  const middle = logos.length ? take(logos, OUTER_ROW, MIDDLE_ROW) : [];
  const bottom = logos.length ? take(logos, OUTER_ROW + MIDDLE_ROW, OUTER_ROW) : [];

  return (
    <section
      className="overflow-hidden pt-18 pb-18 lg:pt-36 lg:pb-36"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, #000 17.34%, rgba(0,0,0,0) 100%), linear-gradient(90deg, #0b2533 0%, #0b2533 100%)",
      })}
    >
      <div className="cs-container flex flex-col items-center text-center text-(--color-light-grey)">
        {heading && (
          <h2
            className="cs-highlight font-extrabold text-[48px] leading-[52px] tracking-[-1.92px] md:text-[72px] md:leading-[78px] xl:text-[96px] xl:leading-[104px] xl:tracking-[-3.84px] normal-case"
            dangerouslySetInnerHTML={{ __html: highlightHtml(heading, "firstToken") }}
          />
        )}
        {short_text && (
          <p className="cs-p2 mt-4 max-w-[686px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />
        )}
        {cta_text && cta_url && (
          <CtaButton variant="outline-light" href={langHref(cta_url.trim(), lang)} className="mt-10">
            {cta_text}
          </CtaButton>
        )}
      </div>

      {logos.length > 0 && (
        <div
          className="mt-16 lg:mt-[82px] flex flex-col items-center gap-6 lg:gap-8"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 78%, transparent 100%)",
          }}
        >
          <div className="flex gap-[22px] lg:gap-[89px]">
            {top.map((logo, i) => <Tile key={i} logo={logo} variant="top" />)}
          </div>

          <div className="w-full overflow-hidden">
            {/* 4 copies: each half of the track is wider than the viewport, so the -50% loop is seamless */}
            <div className="cs-marquee flex">
              {[...middle, ...middle, ...middle, ...middle].map((logo, i) => (
                <div key={i} className="pr-6 lg:pr-24">
                  <Tile logo={logo} variant="middle" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-[22px] lg:gap-[89px]">
            {bottom.map((logo, i) => <Tile key={i} logo={logo} variant="bottom" />)}
          </div>
        </div>
      )}
    </section>
  );
}
