// src/components/major/Footer.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, langHref } from "@/config";
import MoreLocationsToggle from "./MoreLocationsToggle";
import FooterNavColumn from "./FooterNavColumn";
import QuickContact from "@/components/sections/contact-form/QuickContact";

import PhoneIcon from "../../../public/icons/footer-phone.svg";
import MailIcon from "../../../public/icons/footer-mail.svg";
import PinIcon from "../../../public/icons/footer-pin.svg";
import CountUp from "@/components/ui/CountUp";

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

export default async function Footer({ lang = DEFAULT_LANG, hideQuickContact = false }) {
  const themeOptions = await getThemeOptions(lang);

  // GET IN TOUCH — ACF "Theme option — Get in Touch". Hidden when the page
  // renders its own quick_contact_section (e.g. product pages).
  const showQuickContact = themeOptions?.enable_section && !hideQuickContact;

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
  const phone = stripHtml(officeI.telephone);
  const email = stripHtml(officeI.email);
  const contactRows = [
    // tel: keeps only digits and a leading + ("031-123 45 67" → tel:0311234567)
    ["phone", phone, phone ? `tel:${phone.replace(/(?!^\+)[^\d]/g, "")}` : ""],
    ["mail", email, email ? `mailto:${email}` : ""],
    ["pin", stripHtml(officeI.address), ""],
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
      {showQuickContact && <QuickContact id="footer" data={themeOptions} lang={lang} />}

      {/* =====================================================
          FOOTER
         ===================================================== */}
      <footer className="bg-black text-white relative z-10">
        {/* Three tiers: < 768px = Figma "Final Mobile Mockups" FOOTER (2517:5308, every max-md: class);
            768–1023px = the original stacked footer (unprefixed classes); lg+ = Figma desktop. */}
        <div className="cs-container mx-auto w-full web-width pt-16 pb-16 max-md:pt-12 max-md:pb-12 lg:pt-[72px] lg:pb-36 flex flex-col gap-12">
          {/* ============ MAIN ROW: contact / stat card / nav columns ============
              Mobile order (Figma): logo → menus → stat card → contact; the logo/contact column
              is `contents` below md so its two parts can be ordered separately. */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-[59px]">
            {/* LOGO + CONTACT INFO */}
            <div className="max-md:contents lg:w-[200px] shrink-0 flex flex-col gap-6 lg:gap-10 items-start">
              {footerOptions?.footer_logo?.url ? (
                <Image
                  src={footerOptions.footer_logo.url}
                  alt=""
                  width={173}
                  height={27}
                  className="h-[27px] w-auto object-contain max-md:order-1 max-md:self-start"
                />
              ) : (
                <p className="text-[24px] leading-none font-extrabold text-white uppercase max-md:order-1 max-md:self-start">
                  caspeco<span className="text-(--color-yellow)">.</span>
                </p>
              )}

              <div className="flex flex-col items-start gap-6 lg:gap-10 max-md:order-4">
                {/* mobile: rows 16 apart, icon in a 24px box 12px from the text */}
                {contactRows.length > 0 && (
                  <div className="flex flex-col gap-3 max-md:gap-4 text-[18px] font-medium leading-[1.1] tracking-[-0.36px] text-(--color-grey-medium)">
                    {contactRows.map(([icon, value, href]) =>
                      href ? (
                        <a key={icon} href={href} className="group flex items-center gap-2 max-md:gap-3 transition-colors hover:text-(--color-white)">
                          <span className="shrink-0 max-md:flex max-md:w-6 max-md:justify-center transition-transform duration-300 group-hover:-translate-y-0.5">{CONTACT_ICONS[icon]}</span>
                          <span className="cs-link-draw max-md:pb-0!">{value}</span>
                        </a>
                      ) : (
                        <div key={icon} className="flex items-center gap-2 max-md:gap-3">
                          <span className="shrink-0 max-md:flex max-md:w-6 max-md:justify-center">{CONTACT_ICONS[icon]}</span>
                          <span>{value}</span>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {see_location_label && moreLocation && (
                  <MoreLocationsToggle label={see_location_label} html={moreLocation} />
                )}
              </div>
            </div>

            {/* STAT CARD — desktop Figma "USP framed": on hover (Smart Animate 150 ms ease-out) the
                gradient gives way to a 30% #fdfdfd fill and the number grows 64px → 71px.
                Mobile Figma (2517:5342): full-width row, padding 24, gap 24, 2px #FFC120 inside
                stroke, radial gradient from the top-left at 40%, number Bold 54/56, text Regular 16/16. */}
            {statCard.stat_number && (
              <div className="group relative shrink-0 size-60 overflow-hidden rounded-lg pt-[22px] pb-8 px-5 flex flex-col justify-between bg-(--color-grey-dark) shadow-[0px_4px_12px_0px_rgba(0,0,0,0.16)] max-md:order-3 max-md:size-auto max-md:w-full max-md:flex-row max-md:items-center max-md:justify-start max-md:gap-6 max-md:border-2 max-md:border-(--color-yellow) max-md:bg-transparent max-md:p-[22px]">
                <span
                  aria-hidden
                  className="absolute inset-0 md:hidden"
                  style={{
                    backgroundImage:
                      "radial-gradient(141.42% 141.42% at 0% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 49%, rgba(218,220,221,0.2) 100%)",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 transition-opacity duration-150 ease-out group-hover:opacity-0 max-md:hidden"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.5) 0%, rgba(218,220,221,0.2) 50%, transparent 80%)",
                  }}
                />
                <span aria-hidden className="absolute inset-0 bg-[rgba(253,253,253,0.3)] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 max-md:hidden" />

                <p className="relative flex items-start gap-1 text-[64px] leading-16 tracking-[-1.28px] text-(--color-yellow) transition-[font-size,line-height] duration-150 ease-out md:group-hover:text-[71px] md:group-hover:leading-[71px] max-md:shrink-0 max-md:gap-0 max-md:text-[54px] max-md:leading-14 max-md:tracking-[-1.08px]">
                  <CountUp value={String(statCard.stat_number)} className="font-bold" />
                  <span className="font-light max-md:font-normal">%</span>
                </p>
                {statCard.short_text && (
                  <p className="relative text-[20px] leading-6 tracking-[-0.4px] text-white max-md:min-w-0 max-md:flex-1 max-md:text-[16px] max-md:leading-4 max-md:tracking-[-0.32px]">{statCard.short_text}</p>
                )}
              </div>
            )}

            {/* NAV COLUMNS: Services / Company / Insights — splits the
                available space evenly among however many columns exist.
                Mobile: stacked accordions (FooterNavColumn) */}
            {navColumns.length > 0 && (
              <div className="flex flex-wrap gap-12 lg:gap-24 max-md:order-2 max-md:flex-col max-md:flex-nowrap max-md:gap-0">
                {navColumns.map((col, ci) => (
                  <FooterNavColumn
                    key={ci}
                    title={col.title}
                    links={col.links.map((item) => ({ title: item.title, href: langHref(item.link, lang) }))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ============ BOTTOM ROW: social / legal links / copyright ============ */}
          {/* Mobile (Figma): 1px #8F8D88 rule, 48 below it the social row (24 icons, 24 apart,
              8px top/bottom padding), then the legal links stacked 16 apart, then © — 24 between */}
          <div className="border-t border-white/10 pt-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-6 max-md:border-(--color-grey-medium-dark) max-md:pt-12 max-md:flex-col max-md:items-start">
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 max-md:gap-6 max-md:py-2">
                {socialLinks.map(([network, url]) => (
                  <Link
                    key={network}
                    href={url}
                    target="_blank"
                    aria-label={network}
                    className="text-white transition-[color,translate] duration-300 hover:-translate-y-0.5 hover:text-(--color-yellow) focus-visible:text-(--color-yellow)"
                  >
                    {SOCIAL_ICONS[network]}
                  </Link>
                ))}
              </div>
            )}

            {legalLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 max-md:flex-col max-md:items-start max-md:gap-4 text-[18px] font-medium leading-[1.1] tracking-[-0.36px] text-(--color-grey-medium-dark)">
                {legalLinks.map((item, i) => (
                  <Link
                    key={i}
                    href={langHref(item.link, lang)}
                    // mobile Figma: no underline at rest (the redraw line is md+ only)
                    className="cs-link-redraw max-md:bg-none! max-md:pb-0! hover:text-white"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            {copyrightText && (
              <div
                className="cs-rich text-[18px] font-medium leading-[1.1] tracking-[-0.36px] text-(--color-grey-medium-dark) cs-links-draw [&_a:hover]:text-white"
                dangerouslySetInnerHTML={{ __html: copyrightText }}
              />
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
