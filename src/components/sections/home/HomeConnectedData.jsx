// src/components/sections/home/HomeConnectedData.jsx
// ACF layout: data_section — "Connected data": heading, intro, primary + secondary CTA and the
// dashboard visual on top; below, a "Disconnected" vs "Connected" comparison card (two repeaters
// of up to five rows each) with a round arrow on the divider.
// Fields: heading, short_text, cta_text, cta_url, secondary_cta_text, secondary_cta_url,
// section_image, section_heading (Disconnected title), disconnected_items[{label}],
// connected_heading (Connected title), connected_items[{label}], bg_image, bg_color (Styling tab).
// All copy comes from WP (multilingual); the row icons are fixed in code by row index.
// Mobile (< 768): text, image and card stack; the two columns stack with a down arrow between them.

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import ArrowLink from "@/components/ui/ArrowLink";
import Reveal from "@/components/ui/Reveal";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, toHtml } from "@/lib/content";

// Light sections that end on the 72px half gap → this one starts with 72px too (Figma gap rule)
const HALF_GAP_BEFORE = new Set(["data_insight_section", "product_cards_section", "home_tab_section"]);

// No red token in the palette: tones for the "Disconnected" column only
const TONES = {
  disconnected: { text: "text-[#6B2E22]", badge: "bg-[#FBE4DF] text-[#D2452C]" },
  connected: { text: "text-(--color-dark-petrol)", badge: "bg-(--color-petrol)/15 text-(--color-petrol)" },
};

function Svg({ children, size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}

const BarChartIcon = () => (
  <Svg>
    <path d="M3 20.5h18" />
    <rect x="5" y="12" width="3" height="8.5" />
    <rect x="10.5" y="8" width="3" height="12.5" />
    <rect x="16" y="4" width="3" height="16.5" />
  </Svg>
);
const DocumentIcon = () => (
  <Svg>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 9h2M9 13h6M9 17h6" />
  </Svg>
);
const DatabaseIcon = () => (
  <Svg>
    <ellipse cx="12" cy="5" rx="7" ry="3" />
    <path d="M5 5v14c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
    <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" />
  </Svg>
);
const KeyIcon = () => (
  <Svg>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.7 12.3 20 3" />
    <path d="m16 7 2.5 2.5M18.5 4.5 21 7" />
  </Svg>
);
const LinkIcon = () => (
  <Svg>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);
const DollarIcon = () => (
  <Svg>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9.3c-.4-.9-1.5-1.5-2.8-1.5-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2.1 2.8 1 2.8 2.2-1.2 2-2.8 2c-1.3 0-2.4-.6-2.8-1.5M12 6.3v1.5M12 16.1v1.6" />
  </Svg>
);

// Row icons by index (row 4 differs per column)
const ICONS = {
  disconnected: [BarChartIcon, DocumentIcon, DatabaseIcon, KeyIcon, DollarIcon],
  connected: [BarChartIcon, DocumentIcon, DatabaseIcon, LinkIcon, DollarIcon],
};

function Column({ kind, title, items }) {
  const tone = TONES[kind];
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-5">
      {title && (
        <div className="flex items-center gap-4 lg:gap-6">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone.badge}`}>
            <Svg size={22} className="[stroke-width:2]">
              {kind === "connected" ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M7 7l10 10M17 7 7 17" />}
            </Svg>
          </span>
          <h3 className="cs-h4 text-(--color-heading)">{title}</h3>
        </div>
      )}
      {items.length > 0 && (
        <ul className={`flex flex-col ${tone.text}`}>
          {items.map((item, i) => {
            const Icon = ICONS[kind][i] || ICONS[kind][ICONS[kind].length - 1];
            return (
              <li key={i} className="flex items-center gap-4 lg:gap-6">
                <span className="flex w-11 shrink-0 justify-center">
                  <Icon />
                </span>
                <span className="cs-p2 flex-1 border-b border-(--color-grey-medium) py-3 lg:py-[14px]">{item.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function HomeConnectedData({ data, lang = DEFAULT_LANG }) {
  const {
    heading,
    short_text,
    cta_text,
    cta_url,
    secondary_cta_text,
    secondary_cta_url,
    section_image,
    section_heading,
    connected_heading,
  } = data || {};
  const image = mediaUrl(section_image);
  const bgImage = mediaUrl(data?.bg_image);
  if (!heading && !image) return null;

  const label = (r) => (typeof r?.label === "string" ? r.label.trim() : "");
  const disconnected = rows(data?.disconnected_items).filter(label).slice(0, 5);
  const connected = rows(data?.connected_items).filter(label).slice(0, 5);
  const hasLeft = Boolean(section_heading || disconnected.length);
  const hasRight = Boolean(connected_heading || connected.length);

  const primaryHref = cta_text && cta_url?.trim() ? langHref(cta_url.trim(), lang) : "";
  const secondaryHref = secondary_cta_text && secondary_cta_url?.trim() ? langHref(secondary_cta_url.trim(), lang) : "";
  const top = HALF_GAP_BEFORE.has(data?._prev) ? "pt-12 lg:pt-[120px]" : "pt-18 lg:pt-36";

  return (
    <section
      className={`cs-sec relative isolate overflow-hidden ${top} pb-18 lg:pb-36`}
      style={{ background: data?.bg_color || "var(--color-light-grey)" }}
    >
      {/* Mockup curve: bg_image fills a large circle hanging off the right edge (centre ≈ 85% across,
          22% down at 1536 wide, diameter ≈ 72vw); the section edge clips it, and its left arc is the
          curve. A light wash keeps the text and card readable */}
      {bgImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[30vw] -top-[20vw] -z-10 size-[90vw] overflow-hidden rounded-full lg:-right-[20.4vw] lg:-top-[14.3vw] lg:size-[72vw]"
          style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-white/40" />
        </div>
      )}
      <div className="cs-container">
        {/* Top row: text (left) + dashboard visual (right); stacks below 1024 */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 xl:gap-16">
          <Reveal className="flex min-w-0 flex-col items-start gap-6">
            {heading && (
              <h2 className="cs-h2 cs-highlight cs-rich text-(--color-heading)" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            )}
            {short_text && (
              <div
                className="cs-p2 cs-rich text-(--color-grey-dark) lg:max-w-[520px]"
                dangerouslySetInnerHTML={{ __html: toHtml(short_text) }}
              />
            )}
            {(primaryHref || secondaryHref) && (
              <div className="mt-4 flex w-full flex-wrap items-center gap-x-8 gap-y-5 max-md:mt-2 max-md:flex-col max-md:items-start">
                {primaryHref && <CtaButton href={primaryHref}>{cta_text}</CtaButton>}
                {secondaryHref && <ArrowLink href={secondaryHref}>{secondary_cta_text}</ArrowLink>}
              </div>
            )}
          </Reveal>

          {image && (
            <Reveal delay={0.1} className="min-w-0">
              <Image
                src={image}
                alt={section_image?.alt || ""}
                width={section_image?.width || 1600}
                height={section_image?.height || 1000}
                sizes="(min-width: 1320px) 680px, (min-width: 1024px) 54vw, 100vw"
                className="h-auto w-full rounded-2xl lg:rounded-3xl"
              />
            </Reveal>
          )}
        </div>

        {/* Comparison card: Disconnected | arrow on the divider | Connected */}
        {(hasLeft || hasRight) && (
          <Reveal className="mt-12 rounded-3xl bg-(--color-grey-medium)/40 p-6 md:p-10 lg:mt-[72px] lg:rounded-[32px] lg:px-12 lg:py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-8 lg:gap-10">
              {hasLeft && <Column kind="disconnected" title={section_heading} items={disconnected} />}

              {hasLeft && hasRight && (
                <div className="flex shrink-0 items-center justify-center md:flex-col" aria-hidden="true">
                  <span className="hidden w-px flex-1 bg-(--color-grey-medium) md:block" />
                  <span className="flex size-11 items-center justify-center rounded-full bg-(--color-white) text-(--color-dark-petrol) shadow-(--shadow-card) md:size-16">
                    <Svg size={24} className="max-md:rotate-90">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </Svg>
                  </span>
                  <span className="hidden w-px flex-1 bg-(--color-grey-medium) md:block" />
                </div>
              )}

              {hasRight && <Column kind="connected" title={connected_heading} items={connected} />}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
