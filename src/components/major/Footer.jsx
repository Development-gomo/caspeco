// src/components/major/Footer.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getThemeOptions } from "@/lib/api";
import { DEFAULT_LANG, langHref } from "@/config";

import ArrowSvg from "../../../public/right-arrow.svg";

// Inline so we don't need new icon assets uploaded for each network
const SOCIAL_ICONS = {
  linkedin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.62-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z" />
    </svg>
  ),
};

export default async function Footer({ lang = DEFAULT_LANG }) {
  const themeOptions = await getThemeOptions(lang);

  // ================================
  //   GET IN TOUCH SECTION DATA
  // ================================
  const contactBlock = themeOptions?.get_in_touch || {};
  const {
    enable_section,
    sub_heading,
    heading,
    short_description,
    cta_text,
    cta_url,
    bg_image,
  } = contactBlock;

  // FOOTER DATA (ACF "Theme option — Footer" fields)
  const footerOptions = themeOptions?.footer || {};

  const navColumns = [
    { title: "Services", links: footerOptions?.services?.footer_services_links },
    { title: "Cases", links: footerOptions?.cases?.footer_cases_links },
    { title: "Company", links: footerOptions?.company?.footer_company_links },
    { title: "Insights", links: footerOptions?.insights?.footer_insights_links },
  ].filter((col) => col.links?.length > 0);

  const offices = [
    footerOptions?.address?.office_i,
    footerOptions?.address?.office_ii,
  ].filter(Boolean);

  const copyrightText = footerOptions?.copyrights_text;

  // Social links
  const social = footerOptions?.social_links || {};
  const socialLinks = [
    ["linkedin", social.social_linkedin],
    ["instagram", social.social_instagram],
    ["youtube", social.social_youtube],
  ].filter(([, url]) => url);

  return (
    <>
      {enable_section && (
      <section id="footer" className="relative bg-(--color-warm-stone) overflow-hidden">
        <div className="web-width mx-auto px-6 grid lg:grid-cols-2 items-center">
          <div className="max-w-[480px] py-16 lg:py-24">
            {sub_heading && (
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-(--color-clay)"></span>
                <span className="subheading-label text-(--color-navy) uppercase">
                  {sub_heading}
                </span>
              </div>
            )}

            {heading && (
              <h2 className="section-heading text-(--color-navy)">{heading}</h2>
            )}

            {short_description && (
              <div className="mt-6 text-(--color-navy)/80 max-w-md leading-[26px]">
                {short_description}
              </div>
            )}

            {cta_text && cta_url && (
              <Link
                href={langHref(cta_url, lang)}
                className=" mt-8
                      gap-3 group relative inline-flex items-center
                      rounded-sm bg-(--color-navy) px-6 py-4 text-white
                      transition-all duration-300 hover:bg-(--color-navy)
                      w-[154px] overflow-hidden select-none
                    "
              >
                {/* LEFT DOT */}
                <span className="relative w-6 flex items-center justify-center">
                  <span
                    className="
                          absolute h-2 w-2 rounded-full bg-(--color-mint)
                          transition-all duration-300 ease-out
                          group-hover:opacity-0 group-hover:-translate-x-1
                        "
                  ></span>
                </span>

                {/* TEXT */}
                <span
                  className="text-white
                        flex-1 text-[16px] leading-none
                        transition-all duration-300 ease-out
                        group-hover:-translate-x-4
                        whitespace-nowrap
                      "
                >
                  {cta_text}
                </span>

                {/* ARROW */}
                <span className="relative w-4 flex items-center justify-center">
                  <span
                    className="
                          w-4 absolute opacity-0 -translate-x-4
                          transition-all duration-300 ease-out
                          group-hover:opacity-100 group-hover:-translate-x-2
                        ">
                    <Image src={ArrowSvg} width={13} height={13} alt="arrow" />
                  </span>
                </span>
              </Link>
            )}
          </div>

          {/* Mobile: normal in-flow image */}
          {bg_image?.url && (
            <div className="relative h-[220px] lg:hidden">
              <Image src={bg_image.url} alt="" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Desktop: full-bleed image, flush to the section's top/right/bottom edges */}
        {bg_image?.url && (
          <div className="hidden lg:block absolute inset-y-0 right-0 w-[46%]">
            <Image src={bg_image.url} alt="" fill className="object-cover" />
          </div>
        )}
      </section>
      )}

      {/* =====================================================
          FOOTER
         ===================================================== */}
      <footer id="footer" className="bg-(--color-warm-stone) text-(--color-navy) relative z-10 border-t border-(--color-navy)/10">
        <div className="mx-auto w-full web-width px-6 pt-12 pb-8 md:pt-16">
          {/* ============ MAIN ROW: logo / nav columns / offices ============
              Flex, not a fixed grid — so it genuinely adapts to however many
              nav columns exist (3, 4, or more) instead of relying on a fixed
              track count that breaks when a column is empty. */}
          <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-start lg:justify-between  gap-x-10 gap-y-10 pb-8">
            {/* LOGO + TAGLINE */}
            <div className="lg:w-[180px] shrink-0">
              <p className="text-[28px] leading-none font-bold text-black">
                caspeco<span className="text-black">.</span>
              </p>
              <p className="mt-3 text-sm text-(--color-navy) leading-5">
                Digital Activation Agency
                <br />
                by caspecooration Art
              </p>
            </div>

            {/* NAV COLUMNS: Services / Cases / Company / Insights — splits the
                available space evenly among however many columns exist */}
            {navColumns.length > 0 && (
              <div className="flex flex-1 flex-wrap gap-x-8 gap-y-8 min-w-60">
                {navColumns.map((col) => (
                  <div key={col.title} className="min-w-[110px]">
                    <p className="mb-6 text-[14px] font-medium uppercase tracking-[0.17px] text-(--color-grey)">
                      {col.title}
                    </p>
                    <ul className="space-y-3 text-base font-normal text-(--color-navy)/90 leading-6">
                      {col.links.map((item, i) => (
                        <li key={i}>
                          <Link href={langHref(item.link, lang)} className="hover:text-(--color-navy)/60">
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* OFFICES — its own flex item, so it can never get squeezed into
                a nav-column track; wraps to its own line if the row is tight */}
            {offices.length > 0 && (
              <div className="shrink-0">
                <p className="mb-6 text-[14px] font-medium uppercase tracking-[0.17px] text-(--color-grey)">
                  Offices
                </p>
                <div className="flex flex-wrap gap-x-10 gap-y-6 text-[16px]">
                  {offices.map((office, i) => (
                    <div key={i} className="w-[190px] space-y-1 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: office }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============ BOTTOM ROW: copyright (left) / social (right) ============ */}
          {(socialLinks.length > 0 || copyrightText) && (
            <div className="border-t border-(--color-navy)/10 pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              {copyrightText && (
                <p
                  className="text-sm text-(--color-grey) [&_a:hover]:text-(--color-navy)"
                  dangerouslySetInnerHTML={{ __html: copyrightText }}
                />
              )}
              {socialLinks.length > 0 && (
                <div className="flex gap-3">
                  {socialLinks.map(([network, url]) => (
                    <Link
                      key={network}
                      href={url}
                      target="_blank"
                      aria-label={network}
                      className="h-8 w-8 rounded-full border border-(--color-navy)/30 flex items-center justify-center text-(--color-navy) hover:bg-(--color-navy)/10 transition-colors"
                    >
                      {SOCIAL_ICONS[network]}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
