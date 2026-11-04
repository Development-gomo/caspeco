// src/components/sections/home/HomeBusinessTwin.jsx
// ACF layout: home_casestudy_section — "See how venues like yours perform at their best".
// Data: "casestudies" CPT in the current language (mapped server-side in PageBuilder,
// see src/lib/caseStudies.js).
// Default: featured images of the 2 latest case studies. The Industry / Number of
// venues dropdowns are built from the case studies' select_industry / select_venues
// values; on submit the best-matching case study replaces the images.
// Section fields: heading, short_text, cta_text, note_text,
//   industry_placeholder, venues_placeholder, clip_text, read_more_text (optional — fall back to DEFAULT_TEXT).
// Mobile (< 768px, Figma "Customer card" 601:9245; tablet/desktop unchanged): 64px section padding,
//   heading → 16 → text → 24 → form; NO white card behind the form (pill dropdowns #FBFAF9 with 8px
//   gap, 48px button, note_text hidden — not in the mobile mockup). Default state is the latest
//   case's full card (Figma "Customer case card" 601:9259) instead of the image stack: radius 8,
//   padding 32, featured image + 60% black, 90×40 logo, quote → 48 → glass stat tiles → 48 → link.

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import VideoModal from "@/components/ui/VideoModal";
import SelectChevron from "../../../../public/icons/home/select-chevron.svg";
import YoutubeIcon from "../../../../public/icons/home/youtube.svg"; // transparent (the old PNG had a white background)
import { DEFAULT_LANG, entryHref } from "@/config";
import { sectionBackground, toHtml } from "@/lib/content";
import { twinOptions } from "@/lib/caseStudies";
import CountUp from "@/components/ui/CountUp";

// Image stack slots from Figma (560×472 group): back card (2nd latest), front card (latest)
const STACK = [
  { left: 278, top: 97.25, w: 280, h: 277.5, z: 1 },
  { left: 78, top: 0, w: 404, h: 472, z: 2 },
];
const pct = (v, total) => `${(v / total) * 100}%`;

// Used when the section's ACF text fields are left empty
const DEFAULT_TEXT = {
  industry_placeholder: "Industry",
  venues_placeholder: "Number of venues",
  clip_text: "See clip",
  read_more_text: "Read full case",
};
const text = (data, key) => (typeof data?.[key] === "string" && data[key].trim()) || DEFAULT_TEXT[key];

function Select({ placeholder, options, value, onChange }) {
  return (
    <label className="relative block h-[45px] w-full">
      <span className="sr-only">{placeholder}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full cursor-pointer appearance-none rounded-[25px] bg-[rgba(218,220,221,0.5)] pl-5 pr-12 text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-grey-dark) outline-none focus-visible:ring-2 focus-visible:ring-(--color-yellow) max-md:rounded-[50px] max-md:bg-[#FBFAF9] max-md:pl-4 max-md:pr-[42px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {/* mobile: 6×10.5 chevron (10.5 wide once rotated), its visible right edge 16px from the pill's edge */}
      <Image src={SelectChevron} alt="" width={8} height={14} className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 rotate-90 max-md:right-[18.25px] max-md:h-[10.5px] max-md:w-[6px]" />
    </label>
  );
}

// Exact industry + venues match first, then loosen; newest case wins each tier
function findMatch(cases, industry, venues) {
  const by = (fn) => cases.find(fn);
  return (
    (industry && venues && by((c) => c.industry === industry && c.venues === venues)) ||
    (industry && by((c) => c.industry === industry)) ||
    (venues && by((c) => c.venues === venues)) ||
    cases[0] ||
    null
  );
}

// Stat value: the number counts up; on mobile the unit ("%", " h" …) is Tenon Light (Figma).
// Desktop/tablet: the unit span inherits the number's weight, so it renders as before.
const STAT_NUMBER = /^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/s;
function StatValue({ value }) {
  const m = typeof value === "string" ? value.match(STAT_NUMBER) : null;
  if (!m || !m[3]) return <CountUp value={value} />;
  return (
    <>
      <CountUp value={`${m[1]}${m[2]}`} />
      <span className="max-md:font-light">{m[3]}</span>
    </>
  );
}

function CaseCard({ match, lang, clipText, readMoreText }) {
  const stats = match.stats || [];
  const [clipOpen, setClipOpen] = React.useState(false);
  const closeClip = React.useCallback(() => setClipOpen(false), []);
  return (
    // Figma result state: card stretches to the left column's height (self-stretch / h-full).
    // Mobile (Figma 601:9259): content-height card, radius 8, padding 32, sharp image + 60% black, no shadow.
    <div className="relative flex w-full max-w-[560px] min-h-[540px] lg:h-full flex-col justify-between gap-10 overflow-hidden rounded-[16px] bg-white/10 p-6 sm:p-8 shadow-[0px_-68px_100px_-28px_rgba(255,243,208,0.2),2px_4px_12px_8px_rgba(0,0,0,0.1)] max-md:min-h-0 max-md:justify-start max-md:gap-12 max-md:rounded-[8px] max-md:p-8 max-md:shadow-none">
      {match.image?.url && (
        <div className="absolute -inset-14 max-md:inset-0" aria-hidden>
          <Image src={match.image.url} alt="" fill sizes="(max-width: 767px) 100vw, 560px" className="object-cover blur-[8px] max-md:blur-none" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="relative flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4 max-md:items-start">
          {match.logo?.url ? (
            <div className="relative h-14 w-[140px] sm:h-16 sm:w-[180px] max-md:h-10! max-md:w-[90px]!">
              <Image src={match.logo.url} alt={match.logo.alt || match.title} fill sizes="180px" className="object-contain object-left" />
            </div>
          ) : (
            <span className="font-bold text-[20px] leading-6 text-(--color-light-grey)">{match.title}</span>
          )}
          {clipText && match.clipUrl && (
            <button
              type="button"
              onClick={() => setClipOpen(true)}
              className="flex cursor-pointer flex-col items-center gap-1 text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-light-grey) underline"
            >
              <Image src={YoutubeIcon} alt="" width={50} height={35} className="max-md:h-[34.5px] max-md:w-[50px]" />
              {clipText}
            </button>
          )}
          <VideoModal open={clipOpen} url={match.clipUrl} title={match.title} onClose={closeClip} />
        </div>
        {match.quote && (
          <div className="cs-rich italic font-medium text-[20px] sm:text-[24px] leading-[1.3] text-white max-md:font-bold max-md:text-[20px]!" dangerouslySetInnerHTML={{ __html: toHtml(match.quote) }} />
        )}
      </div>

      {/* mobile: quote → 48 → stat tiles → 48 → link */}
      <div className="relative flex flex-col items-center gap-8 max-md:gap-12">
        {stats.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-4 max-md:gap-6">
            {stats.map((s, i) => (
              // mobile tile (Figma 129×114): #FFF 27%, radius 4, padding 12, glass blur 67 (≈ CSS blur 33.5), no gradient/shadow
              <div
                key={i}
                className="flex flex-col gap-6 sm:gap-10 rounded-[8px] p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)] max-md:min-h-[114px] max-md:justify-between max-md:gap-6! max-md:rounded-[4px] max-md:bg-[rgba(255,255,255,0.27)] max-md:bg-none! max-md:p-3! max-md:shadow-none max-md:backdrop-blur-[33.5px]"
                style={{ backgroundImage: "radial-gradient(ellipse 100% 100% at 0% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 49%, rgba(218,220,221,0.2) 100%)" }}
              >
                <span className="font-bold text-[40px] sm:text-[64px] leading-none tracking-[-1.28px] text-(--color-yellow) whitespace-nowrap max-md:font-extrabold max-md:text-[32px]! max-md:leading-[25.6px] max-md:tracking-[-0.64px]"><StatValue value={s.value} /></span>
                <span className="text-[16px] sm:text-[20px] leading-6 tracking-[-0.4px] text-(--color-light-grey) max-md:text-[14px]! max-md:leading-4! max-md:tracking-normal max-md:text-[#FBFAF9]">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        {readMoreText && match.slug && (
          // mobile: Tenon Bold 16/20 and a 16px-wide arrow (8px gap from ArrowLink)
          <ArrowLink tone="light" href={entryHref("casestudy", match.slug, lang)} className="max-md:font-bold max-md:[&_img]:h-auto max-md:[&_img]:w-4">
            {readMoreText}
          </ArrowLink>
        )}
      </div>
    </div>
  );
}

export default function HomeBusinessTwin({ data, lang = DEFAULT_LANG, cases: allCases }) {
  const cases = Array.isArray(allCases) ? allCases : [];
  const [industry, setIndustry] = React.useState("");
  const [venues, setVenues] = React.useState("");
  const [result, setResult] = React.useState(null);

  // Industry options from all cases; venue options narrow to the chosen industry
  const { industries } = twinOptions(cases);
  const { venues: venueOptions } = twinOptions(industry ? cases.filter((c) => c.industry === industry) : cases);
  const images = cases.filter((c) => c.image?.url).slice(0, 2).map((c) => c.image);

  const { heading, short_text, cta_text, note_text } = data || {};
  if (!heading) return null;

  const hasForm = industries.length > 0 || venueOptions.length > 0;

  const onIndustryChange = (value) => {
    setIndustry(value);
    // drop a venue choice that no longer exists for this industry
    if (venues && value && !cases.some((c) => c.industry === value && c.venues === venues)) setVenues("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!cases.length) return;
    setResult(findMatch(cases, industry, venues));
  };

  return (
    // cs-sec: 64px top/bottom below 768px (globals.css); 48px between the form and the case card (gap-12)
    <section className="cs-sec py-18 lg:py-36" style={sectionBackground({ bg_color: data?.bg_color }, { background: "var(--color-dark-petrol)" })}>
      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-start gap-10 lg:gap-[60px] lg:max-w-[631px] lg:pr-6 max-md:gap-6">
          <div className="flex flex-col gap-5 text-(--color-light-grey) max-md:gap-4">
            <h2 className="cs-h2 cs-highlight" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            {short_text && <div className="cs-p2 cs-rich lg:max-w-[603px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {(hasForm || cta_text || note_text) && (
            <form
              onSubmit={onSubmit}
              // mobile: no white card — the dropdowns and button sit straight on the section background
              className="flex w-full max-w-[554px] flex-col gap-10 rounded-[8px] bg-[#fbfaf9] px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] max-md:rounded-none max-md:bg-transparent max-md:p-0! max-md:shadow-none"
            >
              <div className="flex flex-col gap-6">
                {hasForm && (
                  <div className="flex flex-col gap-4 max-md:gap-2">
                    {industries.length > 0 && (
                      <Select placeholder={text(data, "industry_placeholder")} options={industries} value={industry} onChange={onIndustryChange} />
                    )}
                    {venueOptions.length > 0 && (
                      <Select placeholder={text(data, "venues_placeholder")} options={venueOptions} value={venues} onChange={setVenues} />
                    )}
                  </div>
                )}
                {cta_text && (
                  // mobile: Figma padding 11/32/13 with a 24px line (48px tall)
                  <CtaButton type="submit" wrap className="w-full max-md:pt-[11px]! max-md:pb-[13px]! max-md:leading-6!">
                    {cta_text}
                  </CtaButton>
                )}
              </div>
              {note_text && (
                // hidden on mobile: not in the mobile mockup (and dark text on the now-transparent form)
                <div className="cs-rich text-[14px] leading-4 tracking-[-0.28px] text-(--color-grey-dark) max-md:hidden" dangerouslySetInnerHTML={{ __html: toHtml(note_text) }} />
              )}
            </form>
          )}
        </div>

        <div className={`flex w-full justify-center lg:w-[560px] lg:shrink-0 ${result ? "lg:self-stretch" : ""}`}>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                className="w-full lg:h-full"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CaseCard match={result} lang={lang} clipText={text(data, "clip_text")} readMoreText={text(data, "read_more_text")} />
              </motion.div>
            ) : (
              (images.length > 0 || cases[0]) && (
                <motion.div
                  key="stack"
                  className="w-full max-w-[560px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Mobile default (Figma 601:9259): the latest case's full card instead of the image stack */}
                  {cases[0] && (
                    <div className="md:hidden">
                      <CaseCard match={cases[0]} lang={lang} clipText={text(data, "clip_text")} readMoreText={text(data, "read_more_text")} />
                    </div>
                  )}
                  {images.length > 0 && (
                    <div className="relative w-full aspect-[560/472] max-md:hidden">
                      {/* drawn back-to-front: 2nd latest behind, latest in front */}
                      {[images[1], images[0]].map((img, i) => {
                        if (!img) return null;
                        const s = STACK[i];
                        return (
                          <div
                            key={i}
                            className="absolute overflow-hidden rounded-[4px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),1px_2px_6px_4px_rgba(0,0,0,0.1)]"
                            style={{ left: pct(s.left, 560), top: pct(s.top, 472), width: pct(s.w, 560), height: pct(s.h, 472), zIndex: s.z }}
                          >
                            <Image src={img.url} alt={img.alt || ""} fill sizes="(min-width: 1024px) 404px, 70vw" className="object-cover" />
                            <div className="absolute inset-0 bg-black/60" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
