// src/components/major/Footer.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, langHref } from "@/config";
import MoreLocationsToggle from "./MoreLocationsToggle";
import ContactForm from "@/components/sections/contact-form/ContactForm";
import CtaButton from "@/components/ui/CtaButton";

import PhoneIcon from "../../../public/icons/footer-phone.svg";
import MailIcon from "../../../public/icons/footer-mail.svg";
import PinIcon from "../../../public/icons/footer-pin.svg";

// Contact detail icons — exported straight from Figma (already yellow-filled)
const CONTACT_ICONS = {
  phone: <Image src={PhoneIcon} alt="" width={24} height={22} />,
  mail: <Image src={MailIcon} alt="" width={24} height={17} />,
  pin: <Image src={PinIcon} alt="" width={24} height={22} className="w-auto" />,
};

// Strip HTML tags from a WYSIWYG field so it can sit inline next to an icon
function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, "").trim() : "";
}

// Inline so we don't need new icon assets uploaded for each network
const SOCIAL_ICONS = {
  facebook: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
    </svg>
  ),
  linkedin: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
  instagram: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  ),
  youtube: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z" />
    </svg>
  ),
};

export default async function Footer({ lang = DEFAULT_LANG }) {
  const themeOptions = await getThemeOptions(lang);

  // ================================
  //   GET IN TOUCH SECTION DATA — ACF "Theme option — Get in Touch"
  // ================================
  const {
    enable_section,
    background_colour,
    sub_heading,
    heading,
    short_description,
    cta_text,
    cta_url,
    form_shortcode,
  } = themeOptions || {};

  // The field is a raw CF7 shortcode, e.g. [contact-form-7 id="982" title="..."]
  const quickContactFormId = form_shortcode?.match(/id=["'](\d+)["']/)?.[1];

  // FOOTER DATA — theme-options is a single flat ACF object shared by
  // header + footer + get-in-touch, not nested under header/footer keys.
  const footerOptions = themeOptions || {};

  const navColumns = [
    { title: footerOptions?.services?.menu_heading, links: footerOptions?.services?.footer_services_links },
    { title: footerOptions?.company?.menu_heading, links: footerOptions?.company?.footer_company_links },
    { title: footerOptions?.insights?.menu_heading, links: footerOptions?.insights?.footer_insights_links },
  ].filter((col) => col.links?.length > 0);

  const copyrightText = footerOptions?.copyrights_text;

  // Social links
  const social = footerOptions?.social_links || {};
  const socialLinks = [
    ["facebook", social.facebook],
    ["linkedin", social.social_linkedin],
    ["instagram", social.social_instagram],
    ["youtube", social.social_youtube],
  ].filter(([, url]) => url);

  // Contact info — ACF "Theme option — Footer" > address > office_i (telephone/email/address WYSIWYG fields)
  const officeI = footerOptions?.address?.office_i || {};
  const contactRows = [
    ["phone", stripHtml(officeI.telephone)],
    ["mail", stripHtml(officeI.email)],
    ["pin", stripHtml(officeI.address)],
  ].filter(([, value]) => value);

  // Additional locations — ACF "Theme option — Footer" > address > more_location (freeform WYSIWYG)
  const see_location_label_raw = footerOptions?.address?.see_location_label;
  const see_location_label =
    (typeof see_location_label_raw === "string"
      ? see_location_label_raw
      : see_location_label_raw?.label) || "";
  const moreLocation = footerOptions?.address?.more_location;

  // Stat card — ACF "Theme option — Footer" > customer_satisfaction
  const statCard = footerOptions?.customer_satisfaction || {};

  // Legal links repeater — ACF "Theme option — Footer" > privacy_links > privacy_links
  const legalLinks = footerOptions?.privacy_links?.privacy_links || [];

  return (
    <>
      {enable_section && (
      <section
        id="footer"
        className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-[184px] px-6 lg:px-[120px] py-12 lg:py-[72px]"
        style={{ backgroundColor: background_colour || "#0b2533" }}
      >
        <div className="flex flex-col gap-4 items-start w-full lg:w-[476px] shrink-0">
          {sub_heading && (
            <p className="italic text-[24px] leading-7 tracking-[-0.48px] text-(--color-white)">
              {sub_heading}
            </p>
          )}

          {heading && (
            <h2 className="text-[40px] lg:text-[80px] leading-tight lg:leading-[78px] tracking-[-3.2px] font-extrabold text-white normal-case">
              {heading}
            </h2>
          )}

          {(sub_heading || heading) && (
            <div className="h-1 w-full bg-(--color-yellow)" />
          )}

          {short_description && (
            <p className="text-[20px] leading-6 tracking-[-0.4px] text-(--color-white)">
              {short_description}
            </p>
          )}
        </div>

        {quickContactFormId ? (
          <div className="w-full lg:w-[493px] shrink-0 rounded-lg bg-(--color-white) border-6 border-white/50 shadow-[0px_2px_4.5px_0px_rgba(0,0,0,0.1)] px-6 py-7">
            <ContactForm formId={quickContactFormId} lang={lang} submitLabel={cta_text || "Get a call"} />
          </div>
        ) : (
          cta_text && cta_url && (
            <CtaButton href={langHref(cta_url, lang)}>{cta_text}</CtaButton>
          )
        )}
      </section>
      )}

      {/* =====================================================
          FOOTER
         ===================================================== */}
      <footer className="bg-(--color-black) text-(--color-white) relative z-10">
        <div className="mx-auto w-full web-width px-6  pt-16 pb-16 lg:pt-[72px] lg:pb-[144px] flex flex-col gap-12">
          {/* ============ MAIN ROW: contact / stat card / nav columns ============ */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-24">
            {/* LOGO + CONTACT INFO */}
            <div className="lg:w-[180px] shrink-0 flex flex-col gap-6 items-start">
              {footerOptions?.footer_logo?.url ? (
                <Image
                  src={footerOptions.footer_logo.url}
                  alt=""
                  width={173}
                  height={27}
                  className="h-[27px] w-auto object-contain"
                />
              ) : (
                <p className="text-[24px] leading-none font-extrabold text-(--color-white) uppercase">
                  caspeco<span className="text-(--color-yellow)">.</span>
                </p>
              )}

              {contactRows.length > 0 && (
                <div className="flex flex-col gap-3 text-[18px] tracking-[-0.36px] text-(--color-grey-medium)">
                  {contactRows.map(([icon, value]) => (
                    <div key={icon} className="flex items-center gap-2">
                      <span className="shrink-0">{CONTACT_ICONS[icon]}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {see_location_label && moreLocation && (
                <MoreLocationsToggle label={see_location_label} html={moreLocation} />
              )}
            </div>

            {/* STAT CARD */}
            {statCard.stat_number && (
              <div
                className="shrink-0 size-[240px] rounded-lg pt-[22px] pb-[32px] px-5 flex flex-col justify-between bg-(--color-grey-dark) shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-out hover:scale-[1.03] hover:shadow-[0px_8px_20px_0px_rgba(0,0,0,0.3)]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.5) 0%, rgba(218,220,221,0.2) 50%, transparent 80%)",
                }}
              >
                <p className="flex items-start gap-1 leading-[64px] tracking-[-1.28px]">
                  <span className="text-[64px] font-bold text-(--color-yellow)">
                    {statCard.stat_number}
                  </span>
                  <span className="text-[64px] font-light text-(--color-yellow)">%</span>
                </p>
                {statCard.short_text && (
                  <p className="text-[20px] leading-[24px] tracking-[-0.4px] text-(--color-white)">{statCard.short_text}</p>
                )}
              </div>
            )}

            {/* NAV COLUMNS: Services / Company / Insights — splits the
                available space evenly among however many columns exist */}
            {navColumns.length > 0 && (
              <div className="flex flex-1 flex-wrap gap-12 lg:gap-20">
                {navColumns.map((col, ci) => (
                  <div key={ci} className="min-w-[150px]">
                    {col.title && (
                      <p className="mb-5 text-[24px] font-bold tracking-[-0.48px] text-white">
                        {col.title}
                      </p>
                    )}
                    <ul className="space-y-3 text-[18px] font-light tracking-[-0.36px] text-(--color-grey-medium)">
                      {col.links.map((item, i) => (
                        <li key={i}>
                          <Link href={langHref(item.link, lang)} className="hover:text-(--color-white) transition-colors">
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============ BOTTOM ROW: social / legal links / copyright ============ */}
          <div className="border-t border-(--color-white)/10 pt-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-6">
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map(([network, url]) => (
                  <Link
                    key={network}
                    href={url}
                    target="_blank"
                    aria-label={network}
                    className="text-(--color-white) hover:text-(--color-yellow) transition-colors"
                  >
                    {SOCIAL_ICONS[network]}
                  </Link>
                ))}
              </div>
            )}

            {legalLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-16 text-[18px] tracking-[-0.36px] text-(--color-grey-medium-dark)">
                {legalLinks.map((item, i) => (
                  <Link
                    key={i}
                    href={langHref(item.link, lang)}
                    className="underline hover:text-(--color-white) transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            {copyrightText && (
              <p
                className="text-[18px] tracking-[-0.36px] text-(--color-grey-medium-dark) [&_a:hover]:text-(--color-white)"
                dangerouslySetInnerHTML={{ __html: copyrightText }}
              />
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
