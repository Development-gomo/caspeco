// src/components/sections/home/HomeBusinessTwin.jsx
// ACF layout: home_casestudy_section — "See how venues like yours perform at their best".
// Default: three stacked images. After choosing industry + number of venues and
// submitting, the stack is replaced by the matching customer case card (matches repeater).

"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import SelectChevron from "../../../../public/icons/home/select-chevron.svg";
import YoutubeIcon from "../../../../public/icons/home/youtube.png";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

// Image stack slots from Figma (560×472 group): back-right, back-left, front
const STACK = [
  { left: 278, top: 97.25, w: 280, h: 277.5, z: 1 },
  { left: 0, top: 97.5, w: 280, h: 277.5, z: 1 },
  { left: 78, top: 0, w: 404, h: 472, z: 2 },
];
const pct = (v, total) => `${(v / total) * 100}%`;

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

function findMatch(matches, industry, venues) {
  return (
    matches.find((m) => m.industry === industry && (!m.venues || m.venues === venues)) ||
    matches.find((m) => m.industry === industry) ||
    matches[0]
  );
}

function CaseCard({ match, lang }) {
  const stats = rows(match.stats).filter((s) => s.value);
  return (
    <div className="relative flex w-full max-w-[560px] min-h-[540px] flex-col justify-between gap-10 overflow-hidden rounded-[16px] bg-white/10 p-6 sm:p-8 shadow-[0px_-68px_100px_-28px_rgba(255,243,208,0.2),2px_4px_12px_8px_rgba(0,0,0,0.1)]">
      {mediaUrl(match.bg_image) && (
        <div className="absolute -inset-14" aria-hidden>
          <Image src={mediaUrl(match.bg_image)} alt="" fill sizes="560px" className="object-cover blur-[8px]" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="relative flex flex-col gap-8">
        <div className="flex items-center justify-between">
          {mediaUrl(match.logo) ? (
            <div className="relative h-10 w-[90px]">
              <Image src={mediaUrl(match.logo)} alt={match.logo?.alt || ""} fill sizes="90px" className="object-contain object-left" />
            </div>
          ) : <span />}
          {match.clip_text && match.video_url && (
            <a href={match.video_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-[16px] font-medium leading-5 tracking-[-0.32px] text-(--color-light-grey) underline">
              <Image src={YoutubeIcon} alt="" width={50} height={34} className="rounded-[6px]" />
              {match.clip_text}
            </a>
          )}
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
        {match.case_text && match.case_url && (
          <ArrowLink tone="light" href={langHref(match.case_url, lang)}>
            {match.case_text}
          </ArrowLink>
        )}
      </div>
    </div>
  );
}

export default function HomeBusinessTwin({ data, lang = DEFAULT_LANG }) {
  const industries = rows(data?.industry_options).filter((o) => o.value && o.label);
  const venueOptions = rows(data?.venues_options).filter((o) => o.value && o.label);
  const matches = rows(data?.matches);
  const images = rows(data?.images).length ? rows(data.images) : data?.bg_image ? [data.bg_image] : [];

  const [industry, setIndustry] = React.useState("");
  const [venues, setVenues] = React.useState("");
  const [result, setResult] = React.useState(null);

  const { heading, short_text, cta_text, note_text } = data || {};
  if (!heading) return null;

  const hasForm = industries.length > 0 || venueOptions.length > 0;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!matches.length) return;
    setResult(findMatch(matches, industry, venues) || null);
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
                      <Select placeholder={data.industry_placeholder} options={industries} value={industry} onChange={setIndustry} />
                    )}
                    {venueOptions.length > 0 && (
                      <Select placeholder={data.venues_placeholder} options={venueOptions} value={venues} onChange={setVenues} />
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
                <CaseCard match={result} lang={lang} />
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
                  {/* gallery order: [front, left, right] → drawn back-to-front */}
                  {[images[2], images[1], images[0]].map((img, i) => {
                    if (!img) return null;
                    const s = STACK[i];
                    return (
                      <div
                        key={i}
                        className="absolute overflow-hidden rounded-[4px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),1px_2px_6px_4px_rgba(0,0,0,0.1)]"
                        style={{ left: pct(s.left, 560), top: pct(s.top, 472), width: pct(s.w, 560), height: pct(s.h, 472), zIndex: s.z }}
                      >
                        <Image src={mediaUrl(img)} alt={img.alt || ""} fill sizes="(min-width: 1024px) 404px, 70vw" className="object-cover" />
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
