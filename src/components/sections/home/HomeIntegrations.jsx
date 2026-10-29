// src/components/sections/home/HomeIntegrations.jsx
// ACF layout: integrations_section — "100+ integrations" with a three-row logo wall.
// All rows scroll: rows 1 and 3 left → right, the middle row right → left.
// Logos come from Theme Settings → Integrations Logo (`logos`, shared by all languages),
// falling back to the section's own gallery; reused in order if fewer than the wall needs.

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

// Mobile (Figma "Integrations mobile" 2517:5113): every card #FFF@10 with a 1px #FFF@10 stroke and a
// 0 2.17 9.79 #000@10 shadow; small rows 72px cards / 50px logos, middle row 88 / 62, logo radius 9
function Tile({ logo, variant }) {
  const big = variant === "middle";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[12px] max-md:bg-none! max-md:bg-white/10 max-md:border max-md:border-white/10 max-md:shadow-[0px_2.17px_9.79px_0px_rgba(0,0,0,0.1)] ${big ? "size-[80px] lg:size-[107px] max-md:size-[88px]" : "size-[66px] lg:size-[88px] max-md:size-[72px]"}`}
      style={{ backgroundImage: ROW_TILE[variant] }}
    >
      <div className={`relative overflow-hidden rounded-[10px] bg-white max-md:rounded-[9px] ${big ? "size-[54px] lg:size-[72px] max-md:size-[62px]" : "size-[45px] lg:size-[60px] max-md:size-[50px]"}`}>
        <Image src={mediaUrl(logo)} alt={logo.alt || logo.title || ""} fill sizes="72px" className="object-contain p-1.5" />
      </div>
    </div>
  );
}

const take = (list, start, count) => Array.from({ length: count }, (_, i) => list[(start + i) % list.length]);

// Durations give all rows the same pixel speed: the track moves half its width per loop
// (outer half = 12 × 177px, middle half = 14 × 203px at desktop → 3:4 ratio, ~35px/s).
// To change the speed, scale all three values together to keep that ratio.
const ROW_DURATION = { top: "60s", middle: "80s", bottom: "60s" };

// Seamless marquee: 4 copies so each half of the track is wider than the viewport.
// Spacing is padding (not gap) so the -50% loop point lines up exactly.
function MarqueeRow({ logos, variant, reverse = false }) {
  const spacing = variant === "middle" ? "pr-6 lg:pr-24" : "pr-[22px] lg:pr-[89px] max-md:pr-[31px]";
  return (
    <div className="w-full overflow-hidden">
      <div
        className="cs-marquee flex"
        style={{ animation: `${reverse ? "cs-marquee-right" : "cs-marquee"} ${ROW_DURATION[variant]} linear infinite` }}
      >
        {[...logos, ...logos, ...logos, ...logos].map((logo, i) => (
          <div key={i} className={spacing}>
            <Tile logo={logo} variant={variant} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeIntegrations({ data, logos: themeLogos, lang = DEFAULT_LANG }) {
  const logos = (themeLogos?.length ? themeLogos : rows(data?.logos)).filter((l) => mediaUrl(l));
  const { heading, short_text, cta_text, cta_url } = data || {};
  if (!heading && logos.length === 0) return null;

  const top = logos.length ? take(logos, 0, OUTER_ROW) : [];
  const middle = logos.length ? take(logos, OUTER_ROW, MIDDLE_ROW) : [];
  const bottom = logos.length ? take(logos, OUTER_ROW + MIDDLE_ROW, OUTER_ROW) : [];

  // Mobile: 64 top / bottom (cs-sec); H2 Tenon Bold 64 / 80%, -2%; H2 -> text 24, text -> button 24,
  // button -> logo wall 42 (Figma 398 - 356), rows 24 apart, edge fade 17%
  return (
    <section
      className="cs-sec overflow-hidden pt-18 pb-18 lg:pt-36 lg:pb-36"
      style={sectionBackground(data, {
        backgroundImage: "linear-gradient(180deg, #000 17.34%, rgba(0,0,0,0) 100%), linear-gradient(90deg, #0b2533 0%, #0b2533 100%)",
      })}
    >
      <div className="cs-container flex flex-col items-center text-center text-(--color-light-grey)">
        {heading && (
          <h2
            className="cs-highlight font-extrabold text-[48px] leading-[52px] tracking-[-1.92px] md:text-[72px] md:leading-[78px] xl:text-[96px] xl:leading-[104px] xl:tracking-[-3.84px] normal-case max-md:font-bold max-md:text-[64px] max-md:leading-[51.2px] max-md:tracking-[-1.28px]"
            dangerouslySetInnerHTML={{ __html: highlightHtml(heading, "firstToken") }}
          />
        )}
        {short_text && (
          <div className="cs-p2 cs-rich mt-4 max-w-[686px] max-md:mt-6 max-md:text-white" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />
        )}
        {cta_text && cta_url && (
          <CtaButton variant="outline-light-yellow" href={langHref(cta_url.trim(), lang)} className="mt-10 max-md:mt-6">
            {cta_text}
          </CtaButton>
        )}
      </div>

      {logos.length > 0 && (
        <div
          className="mt-16 lg:mt-[82px] flex flex-col items-center gap-6 lg:gap-8 max-md:mt-[42px] max-md:[--fade:17%]"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0%, #000 var(--fade, 22%), #000 calc(100% - var(--fade, 22%)), transparent 100%)",
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 var(--fade, 22%), #000 calc(100% - var(--fade, 22%)), transparent 100%)",
          }}
        >
          <MarqueeRow logos={top} variant="top" reverse />
          <MarqueeRow logos={middle} variant="middle" />
          <MarqueeRow logos={bottom} variant="bottom" reverse />
        </div>
      )}
    </section>
  );
}
