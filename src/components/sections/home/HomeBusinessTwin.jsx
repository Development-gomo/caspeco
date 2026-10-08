// src/components/sections/home/HomeBusinessTwin.jsx
// ACF layout: home_casestudy_section — "See how venues like yours perform at their best".
// Data: "casestudies" CPT in the current language (mapped server-side in PageBuilder,
// see src/lib/caseStudies.js).
// Default: featured images of the 2 latest case studies. The Industry / Number of
// venues dropdowns are built from the case studies' select_industry / select_venues
// values; on submit the best-matching case study replaces the images.
// Section fields: heading, short_text, cta_text, note_text,
//   industry_placeholder, venues_placeholder, clip_text, read_more_text (optional — fall back to DEFAULT_TEXT).

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import VideoModal from "@/components/ui/VideoModal";
import SelectChevron from "../../../../public/icons/home/select-chevron.svg";
import YoutubeIcon from "../../../../public/icons/home/youtube.png";
import { DEFAULT_LANG, langHref } from "@/config";
import { sectionBackground, toHtml } from "@/lib/content";
import { twinOptions } from "@/lib/caseStudies";

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
        className="h-full w-full cursor-pointer appearance-none rounded-[25px] bg-[rgba(218,220,221,0.5)] pl-5 pr-12 text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-grey-dark) outline-none focus-visible:ring-2 focus-visible:ring-(--color-yellow)"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Image src={SelectChevron} alt="" width={8} height={14} className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 rotate-90" />
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

function CaseCard({ match, lang, clipText, readMoreText }) {
  const stats = match.stats || [];
  const [clipOpen, setClipOpen] = React.useState(false);
  const closeClip = React.useCallback(() => setClipOpen(false), []);
  return (
    <div className="relative flex w-full max-w-[560px] min-h-[540px] flex-col justify-between gap-10 overflow-hidden rounded-[16px] bg-white/10 p-6 sm:p-8 shadow-[0px_-68px_100px_-28px_rgba(255,243,208,0.2),2px_4px_12px_8px_rgba(0,0,0,0.1)]">
      {match.image?.url && (
        <div className="absolute -inset-14" aria-hidden>
          <Image src={match.image.url} alt="" fill sizes="560px" className="object-cover blur-[8px]" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="relative flex flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          {match.logo?.url ? (
            <div className="relative h-10 w-[90px]">
              <Image src={match.logo.url} alt={match.logo.alt || match.title} fill sizes="90px" className="object-contain object-left" />
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
              <Image src={YoutubeIcon} alt="" width={50} height={34} className="rounded-[6px]" />
              {clipText}
            </button>
          )}
          <VideoModal open={clipOpen} url={match.clipUrl} title={match.title} onClose={closeClip} />
        </div>
        {match.quote && (
          <p className="italic font-medium text-[20px] sm:text-[24px] leading-[1.3] text-white" dangerouslySetInnerHTML={{ __html: toHtml(match.quote) }} />
        )}
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {stats.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-6 sm:gap-10 rounded-[8px] p-4 sm:p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)]"
                style={{ backgroundImage: "radial-gradient(ellipse 100% 100% at 0% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 49%, rgba(218,220,221,0.2) 100%)" }}
              >
                <span className="font-bold text-[40px] sm:text-[64px] leading-none tracking-[-1.28px] text-(--color-yellow) whitespace-nowrap">{s.value}</span>
                <span className="text-[16px] sm:text-[20px] leading-6 tracking-[-0.4px] text-(--color-light-grey)">{s.label}</span>
              </div>
            ))}
          </div>
        )}
        {readMoreText && match.slug && (
          <ArrowLink tone="light" href={langHref(`/case-study/${match.slug}`, lang)}>
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
    <section className="py-18 lg:py-36" style={sectionBackground({ bg_color: data?.bg_color }, { background: "var(--color-dark-petrol)" })}>
      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-start gap-10 lg:gap-[60px] lg:max-w-[631px] lg:pr-6">
          <div className="flex flex-col gap-5 text-(--color-light-grey)">
            <h2 className="cs-h2 cs-highlight" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            {short_text && <p className="cs-p2 lg:max-w-[603px]" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {(hasForm || cta_text || note_text) && (
            <form
              onSubmit={onSubmit}
              className="flex w-full max-w-[554px] flex-col gap-10 rounded-[8px] bg-(--color-white) px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)]"
            >
              <div className="flex flex-col gap-6">
                {hasForm && (
                  <div className="flex flex-col gap-4">
                    {industries.length > 0 && (
                      <Select placeholder={text(data, "industry_placeholder")} options={industries} value={industry} onChange={onIndustryChange} />
                    )}
                    {venueOptions.length > 0 && (
                      <Select placeholder={text(data, "venues_placeholder")} options={venueOptions} value={venues} onChange={setVenues} />
                    )}
                  </div>
                )}
                {cta_text && (
                  <CtaButton type="submit" wrap className="w-full">
                    {cta_text}
                  </CtaButton>
                )}
              </div>
              {note_text && (
                <p className="text-[14px] leading-4 tracking-[-0.28px] text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(note_text) }} />
              )}
            </form>
          )}
        </div>

        <div className="flex w-full justify-center lg:w-[560px] lg:shrink-0">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                className="w-full"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <CaseCard match={result} lang={lang} clipText={text(data, "clip_text")} readMoreText={text(data, "read_more_text")} />
              </motion.div>
            ) : (
              images.length > 0 && (
                <motion.div
                  key="stack"
                  className="relative w-full max-w-[560px] aspect-[560/472]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
