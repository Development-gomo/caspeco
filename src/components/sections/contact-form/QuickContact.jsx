// src/components/sections/contact-form/QuickContact.jsx
// Figma "Quick contact": italic sub heading, big heading, yellow rule, text and the
// phone form card. Used by:
//  - the Footer (ACF Theme option — Get in Touch): CF7 form from form_shortcode
//  - the product_builder layout quick_contact_section: form built from ACF
//    form_fields and sent to form_provider (CF7 / HubSpot …, see lib/forms.js)
// Optional bg_image (ICP pages) sits behind a dark overlay instead of the flat colour.

import Image from "next/image";
import ContactForm from "./ContactForm";
import QuickContactForm from "./QuickContactForm";
import CtaButton from "@/components/ui/CtaButton";
import { DEFAULT_LANG, langHref } from "@/config";
import { hasText, mediaUrl, toHtml, rows } from "@/lib/content";
import { cf7FormId } from "@/lib/forms";
import { parseHubspotEmbed } from "@/lib/hubspot";
import HubspotEmbed from "@/components/ui/HubspotEmbed";
import HeadingRule from "@/components/ui/HeadingRule";
import RuleLine from "../../../../public/icons/quick-contact-rule.svg";

// Form card: 493 wide, content 445 (Figma "phone-contact-form", 864 → 1309).
// variant "icp" — Figma ICP "Quick contact" (Opening soon / Levelling up): #FBFAF9 card, padding
// 28/24, shadow 0 2 9 #000@10% (no white glass edge)
// Mobile (< 768, Figma "Contact card" 2517:5286): eyebrow, heading, text AND the form sit in one
// #FBFAF9 card (padding 24/24/32/24, r8, shadow 0 2 9 #000@10%), so the form card itself turns plain
// there and the MOBILE_CARD wrapper (display: contents from md up) draws the card instead.
const CARD_MOBILE_PLAIN = "max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:shadow-none max-md:p-0";
const MOBILE_CARD =
  "max-md:flex max-md:w-full max-md:flex-col max-md:gap-8 max-md:rounded-lg max-md:bg-[#FBFAF9] max-md:px-6 max-md:pt-6 max-md:pb-8 max-md:shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] md:contents";
const CARD = {
  default: "rounded-lg bg-white border-6 border-white/50 shadow-[0px_2px_4.5px_0px_rgba(0,0,0,0.1)] py-7 px-[18px]",
  icp: "rounded-lg bg-[#FBFAF9] shadow-[0px_2px_9px_0px_rgba(0,0,0,0.1)] px-6 py-7",
};

// form: optional ready-made form node for the card (ICP pages: HubSpot embed)
export default function QuickContact({ data, lang = DEFAULT_LANG, id, form, variant = "default" }) {
  const card = `w-full lg:w-[493px] shrink-0 ${CARD[variant] || CARD.default} ${CARD_MOBILE_PLAIN}`;
  const { background_colour, sub_heading, heading, short_description, cta_text, cta_url, form_shortcode } = data || {};
  const hasAcfForm = rows(data?.form_fields).some((f) => f.name);
  // form_shortcode (Theme options footer) takes a CF7 shortcode / ID or a HubSpot embed code
  const hubspotCode = !form && !hasAcfForm && parseHubspotEmbed(form_shortcode) ? form_shortcode : "";
  if (hubspotCode) form = <HubspotEmbed code={hubspotCode} />;
  const cf7Id = !hasAcfForm && !hubspotCode && cf7FormId(form_shortcode);
  const hasSub = hasText(sub_heading);
  const hasHeading = hasText(heading);
  const hasDescription = hasText(short_description);
  if (!hasHeading && !hasAcfForm && !cf7Id && !form) return null;
  const bgImage = mediaUrl(data?.bg_image);

  // Desktop row = 120 + 476 (text) + 184 (gap) + 493 (card) + 120 = 1393px. Below that (1024–1392)
  // the side padding (min 24) and gap (min 48) shrink together so the row always fills the width
  // exactly (pad = 29.2683% − 287.707px, gap = content − 969px); below 1065 both are at their minimum
  // and the text column narrows instead (content − 541px) with the heading scaled to it in cqw
  // (80/78/−3.2 of 476). From 1393px up every value resolves to the fixed Figma size.
  return (
    <section
      id={id}
      className="relative isolate overflow-hidden flex flex-col lg:flex-row items-center justify-center gap-12 min-[1024px]:gap-[clamp(48px,calc(100%-969px),184px)] px-6 min-[1024px]:px-[clamp(24px,calc(29.2683%-287.707px),120px)] py-12 max-md:py-16 lg:py-[72px]"
      style={{ backgroundColor: background_colour || "#0b2533" }}
    >
      {bgImage && (
        <>
          {/* Figma ICP "Quick contact": photo with 31.2px layer blur over #0B2533, no extra overlay */}
          <Image src={bgImage} alt="" fill sizes="100vw" className="-z-10 scale-110 object-cover blur-[31.2px]" />
        </>
      )}
      {/* Mobile: one card around the text and the form (display: contents from md up — no layout box) */}
      <div className={MOBILE_CARD}>
      {(hasSub || hasHeading || hasDescription) && (
      <div className="flex flex-col gap-4 items-start w-full min-[1024px]:w-[min(476px,calc(100%-541px))] min-[1024px]:@container shrink-0">
        {/* Figma mobile: Light Italic 18/22, -2%, #3F3E3C */}
        {hasSub && <p className="italic text-[24px] leading-7 tracking-[-0.48px] text-white max-md:text-[18px] max-md:leading-[22px] max-md:tracking-[-0.36px] max-md:font-light max-md:text-[#3F3E3C]">{sub_heading}</p>}

        {hasHeading && (
          <h2
            className="cs-title cs-highlight text-[40px] min-[1024px]:text-[min(80px,16.807cqw)] leading-tight min-[1024px]:leading-[min(78px,16.387cqw)] tracking-[-3.2px] min-[1024px]:tracking-[max(-3.2px,-0.6723cqw)] font-extrabold text-[#fff] max-md:text-[#151411] normal-case"
            dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
          />
        )}

        {/* Figma "Vector 875": hand-drawn curved stroke (4px, round caps). The SVG has 2px of
            padding around the stroke, so the negative margins keep it in a 4px slot. Full width by
            default; from 1024 up HeadingRule sets --rule-w to the heading's last line + 4px. */}
        {(hasSub || hasHeading) && (
          <HeadingRule src={RuleLine} className="-mx-0.5 -my-0.5 h-2 w-[calc(100%+4px)] min-[1024px]:w-[var(--rule-w,calc(100%+4px))] max-w-none max-md:hidden" />
        )}

        {hasDescription && (
          // Figma mobile: Light 18/22 #3F3E3C, 8 under the heading
          <div className="cs-rich cs-text text-[20px] leading-6 tracking-[-0.4px] text-white max-md:-mt-2 max-md:font-light! max-md:text-[#3F3E3C]" dangerouslySetInnerHTML={{ __html: toHtml(short_description) }} />
        )}
      </div>
      )}

      {form ? (
        <div className={card}>{form}</div>
      ) : hasAcfForm || cf7Id ? (
        <div className={card}>
          {hasAcfForm ? (
            <QuickContactForm data={data} lang={lang} />
          ) : (
            <ContactForm formId={cf7Id} lang={lang} submitLabel={cta_text || "Get a call"} quick />
          )}
        </div>
      ) : (
        // No form connected yet: keep the form column so the text stays left-aligned as in Figma
        <div className={`w-full lg:w-[493px] lg:h-[383px] shrink-0 lg:flex lg:items-center ${cta_text && cta_url ? "" : "hidden lg:flex"}`}>
          {cta_text && cta_url && <CtaButton href={langHref(cta_url, lang)}>{cta_text}</CtaButton>}
        </div>
      )}
      </div>
    </section>
  );
}
