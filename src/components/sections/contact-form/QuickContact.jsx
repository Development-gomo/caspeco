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
import { mediaUrl, toHtml, rows } from "@/lib/content";
import { cf7FormId } from "@/lib/forms";
import RuleLine from "../../../../public/icons/quick-contact-rule.svg";

export default function QuickContact({ data, lang = DEFAULT_LANG, id }) {
  const { background_colour, sub_heading, heading, short_description, cta_text, cta_url, form_shortcode } = data || {};
  const hasAcfForm = rows(data?.form_fields).some((f) => f.name);
  const cf7Id = !hasAcfForm && cf7FormId(form_shortcode);
  if (!heading && !hasAcfForm && !cf7Id) return null;
  const bgImage = mediaUrl(data?.bg_image);

  return (
    <section
      id={id}
      className="relative isolate overflow-hidden flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-[184px] px-6 lg:px-[120px] py-12 lg:py-[72px]"
      style={{ backgroundColor: background_colour || "#0b2533" }}
    >
      {bgImage && (
        <>
          <Image src={bgImage} alt="" fill sizes="100vw" className="-z-10 object-cover" />
          <span className="absolute inset-0 -z-10 bg-black/55" aria-hidden />
        </>
      )}
      <div className="flex flex-col gap-4 items-start w-full lg:w-[476px] shrink-0">
        {sub_heading && <p className="italic text-[24px] leading-7 tracking-[-0.48px] text-white">{sub_heading}</p>}

        {heading && (
          <h2
            className="cs-highlight text-[40px] lg:text-[80px] leading-tight lg:leading-[78px] tracking-[-3.2px] font-extrabold text-[#fff] normal-case"
            dangerouslySetInnerHTML={{ __html: toHtml(heading) }}
          />
        )}

        {/* Figma "Vector 875": hand-drawn curved stroke (4px, round caps). The SVG has 2px of
            padding around the stroke, so the negative margins keep it in a 4px slot at full width. */}
        {(sub_heading || heading) && (
          <Image src={RuleLine} alt="" aria-hidden className="-mx-0.5 -my-0.5 h-2 w-[calc(100%+4px)] max-w-none" />
        )}

        {short_description && (
          <div className="cs-rich text-[20px] leading-6 tracking-[-0.4px] text-white" dangerouslySetInnerHTML={{ __html: toHtml(short_description) }} />
        )}
      </div>

      {hasAcfForm || cf7Id ? (
        <div className={`w-full lg:w-[493px] shrink-0 rounded-lg bg-white border-6 border-white/50 shadow-[0px_2px_4.5px_0px_rgba(0,0,0,0.1)] py-7 ${hasAcfForm ? "px-[18px]" : ""}`}>
          {hasAcfForm ? (
            <QuickContactForm data={data} lang={lang} />
          ) : (
            <ContactForm formId={cf7Id} lang={lang} submitLabel={cta_text || "Get a call"} />
          )}
        </div>
      ) : (
        // No form connected yet: keep the form column so the text stays left-aligned as in Figma
        <div className={`w-full lg:w-[493px] lg:h-[383px] shrink-0 lg:flex lg:items-center ${cta_text && cta_url ? "" : "hidden lg:flex"}`}>
          {cta_text && cta_url && <CtaButton href={langHref(cta_url, lang)}>{cta_text}</CtaButton>}
        </div>
      )}
    </section>
  );
}
