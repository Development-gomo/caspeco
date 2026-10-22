// src/components/major/Header.jsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DownSvg from "../../../public/down-arrow.svg";
import { getThemeOptions, getEntryTranslations } from "@/lib/api";
import { DEFAULT_LANG, SUPPORTED_LANGS, LANGUAGES, LOCALE_MAP, langHref, langHome, entryHref, langName, altLangs as otherLangs } from "@/config";

// WPML-style flag for a language code (files in /public/flags)
function LangFlag({ code, className = "" }) {
  const src = LANGUAGES[code]?.flag;
  if (!src) return null;
  return <Image src={src} alt="" width={24} height={16} unoptimized className={`w-6 h-4 shrink-0 object-cover ${className}`} />;
}

// Log-in links point at external portals: absolute URLs open as-is, relative ones get the
// language prefix, and an empty/"#" URL renders plain text instead of a dead link.
function LoginLink({ url, lang, className: baseClassName, onClick, children }) {
  // pointer even when rendered as text: "Log In" also opens the dropdown on hover
  const className = `cursor-pointer ${baseClassName}`;
  const href = (url || "").trim();
  if (!href || href === "#") return <span className={className}>{children}</span>;
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={langHref(href, lang)} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function Header({
  lang = DEFAULT_LANG,
  currentSlug = "",
  entryType = "page",
  pathPrefix = "",
  // ROUTE_TYPES key ("post", "casestudy", …): the switcher then uses each language's own URL base
  routeType = null,
  entryId = null,
  prefetchedOptions = null,
  logoUrl = "",
}) {
  const [options, setOptions] = useState(prefetchedOptions);
  const altLangs = otherLangs(lang);
  const [altLangUrls, setAltLangUrls] = useState(
    Object.fromEntries(altLangs.map((l) => [l, langHome(l)]))
  );
  const isLoading = !options;
  const [scrolled, setScrolled] = useState(false);

  // Nav items come from the Theme Options "mega_menu" repeater (entries with
  // menu_title set) — each entry's columns/links/card drive the dropdown.
  const navItems = (options?.mega_menu || [])
    .filter((entry) => entry.menu_title)
    .map((entry, i) => {
      const columns = (entry.columns || []).filter(
        (col) => col.links?.length > 0 || col.card?.title
      );
      const card = columns.map((col) => col.card).find((c) => c?.title);
      const children = columns.flatMap((col, ci) =>
        (col.links || []).map((link, li) => ({
          id: `mega-${i}-${ci}-${li}`,
          title: link.label,
          url: link.url?.url || "#",
        }))
      );
      return {
        id: `mega-${i}`,
        title: entry.menu_title,
        url: entry.menu_title_link?.url || "#",
        columns,
        card,
        sideImage: entry.side_image?.url || null,
        children,
      };
    });

  // Theme Options "Log In Submenu" rows with text
  const loginItems = (Array.isArray(options?.login_submenu) ? options.login_submenu : []).filter((row) => row?.link_text?.trim());

  // Only fetch client-side if the page didn't pass Theme Options
  useEffect(() => {
    if (prefetchedOptions) return;
    getThemeOptions(lang)
      .then((themeOptions) => setOptions(themeOptions || {}))
      .catch(() => setOptions({}));
  }, [lang, prefetchedOptions]);

  // Header starts transparent; the dark blurred overlay fades in once the
  // page has scrolled.
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // The blurred bar is a background layer, not the header itself: an element with
  // backdrop-filter stops descendants (the hover dropdowns) from blurring what is behind them.
  const headerClasses = "fixed top-0 w-full z-50 text-white";
  const headerBarClasses = `absolute inset-0 -z-10 transition-[background-color,backdrop-filter] duration-300 ${
    scrolled ? "backdrop-blur-[8px] bg-black/40" : "bg-transparent"
  }`;

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = React.useRef(null);

  function handleNavClick(e, rawUrl, closeMobile = false) {
    if (!rawUrl?.includes("#")) return;
    const hash = "#" + rawUrl.split("#")[1];
    const el = document.querySelector(hash);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth" });
    }
    if (closeMobile) {
      setMobileOpen(false);
      setOpenSubmenu(null);
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchAltLangUrls() {
      const altLangList = SUPPORTED_LANGS.filter((l) => l !== lang);
      const fallback = Object.fromEntries(altLangList.map((l) => [l, langHome(l)]));

      // Homepage never passes currentSlug — the translated homepage always
      // lives at that language's root, regardless of its WP slug.
      if (!currentSlug) {
        setAltLangUrls(fallback);
        return;
      }

      // Use entryId for dynamic translation lookup if available
      if (entryId) {
        try {
          const translations = await getEntryTranslations(entryId, entryType, lang);

          const urls = { ...fallback };
          for (const altLang of altLangList) {
            const translatedSlug = translations?.[altLang]?.slug;
            if (!translatedSlug) continue;
            // "frontpage" is the WP homepage slug — map it to the lang root
            if (translatedSlug === "frontpage") {
              urls[altLang] = langHome(altLang);
              continue;
            }
            if (routeType) {
              urls[altLang] = entryHref(routeType, translatedSlug, altLang);
              continue;
            }
            const prefix = pathPrefix ? `/${pathPrefix}` : "";
            const langPrefix = altLang === DEFAULT_LANG ? "" : `/${altLang}`;
            urls[altLang] = `${langPrefix}${prefix}/${translatedSlug}`;
          }
          setAltLangUrls(urls);
          return;
        } catch (error) {
          setAltLangUrls(fallback);
          return;
        }
      }

      // Fallback: if no entryId, go to homepage for each language
      setAltLangUrls(fallback);
    }

    if (entryId || (currentSlug && currentSlug !== "/")) {
      fetchAltLangUrls();
    }
  }, [lang, currentSlug, entryType, pathPrefix, routeType, entryId]);

  return (
    <header className={headerClasses}>
      <span aria-hidden className={headerBarClasses} />
      <div className="cs-container py-4 lg:py-0 lg:h-[84px] flex items-center justify-between relative">
        {/* LOGO + DESKTOP LINKS */}
        <div className="flex items-center gap-8 xl:gap-16">
          <Link
            href={langHome(lang)}
            className="flex relative h-8 w-[100px] lg:h-[22px] lg:w-[140px] xl:h-[26px] xl:w-[170px]"
          >
            {(() => {
              // Header is always the dark translucent bar, so always use the light logo variant
              const activeLogo = logoUrl || options?.logo_light?.url || options?.logo_dark?.url;

              if (!activeLogo) return null;

              return (
                <Image
                  src={activeLogo}
                  alt="caspeco. logo"
                  width={170}
                  height={26}
                  className="object-contain"
                  priority
                />
              );
            })()}
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-6 xl:gap-12 relative">
              {isLoading ? (
                // SKELETON MENU (no jump)
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li
                      key={"sk-" + i}
                      className="w-20 h-[18px] rounded-full bg-white/30 animate-pulse"
                    />
                  ))}
                </>
              ) : (
                // REAL MENU
                navItems.map((item) => (
                  <li key={item.id} className="relative group">
                    <Link
                      href={langHref(item.url, lang)}
                      prefetch={true}
                      onClick={(e) => handleNavClick(e, item.url)}
                      className="text-(--color-light-grey) hover:text-white relative z-9 text-[16px] xl:text-[18px] font-bold transition leading-[18px] flex items-center gap-2 whitespace-nowrap"
                    >
                      {item.title}

                      {item.children?.length > 0 && (
                        <span className="transition-transform duration-300 group-hover:rotate-180">
                          <Image
                            src={DownSvg}
                            alt="arrow"
                            width={10}
                            height={10}
                          />
                        </span>
                      )}
                    </Link>

                    {/* MEGA MENU PANEL — multi-column, driven by ACF columns/links/card */}
                    {item.columns?.length > 0 ? (
                      <div
                        className="
                            top-[15px]
                            absolute left-1/2 mt-1
                            -translate-x-1/2 min-w-[520px]
                            pt-8
                            pointer-events-none
                            group-hover:pointer-events-auto
                         z-2
                          "
                      >
                        <div className="
                            opacity-0 translate-x-4
                            group-hover:opacity-100 group-hover:translate-x-0
                            transition-all duration-300 ease-out bg-black/40 backdrop-blur-[8px] text-white rounded-sm shadow-lg overflow-hidden
                            flex
                          "
                        >
                          <div className="flex flex-1 divide-x divide-white/10">
                            {item.columns.map((col, ci) => (
                              <ul key={ci} className="min-w-[180px] py-2">
                                {(col.links || []).map((link, li) => (
                                  <li key={li}>
                                    <Link
                                      href={langHref(link.url?.url || "#", lang)}
                                      prefetch={true}
                                      onClick={(e) => handleNavClick(e, link.url?.url)}
                                      target={link.url?.target || undefined}
                                      className="block px-4 py-3 text-white text-sm hover:text-white/70 transition"
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ))}
                          </div>

                          {item.card && (
                            <div className="w-[220px] shrink-0 bg-white/5 p-5 flex flex-col gap-2">
                              {item.sideImage && (
                                <div className="relative w-full h-[100px] mb-2">
                                  <Image src={item.sideImage} alt="" fill className="object-cover rounded-sm" />
                                </div>
                              )}
                              <p className="font-bold text-sm">{item.card.title}</p>
                              {item.card.description && (
                                <p className="text-xs text-white/70">{item.card.description}</p>
                              )}
                              {item.card.button_link?.url && (
                                <Link
                                  href={langHref(item.card.button_link.url, lang)}
                                  target={item.card.button_link.target || undefined}
                                  className="mt-2 text-sm font-bold text-(--color-yellow) hover:underline"
                                >
                                  {item.card.button_link.title || "Learn more"}
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : item.children?.length > 0 && (
                      <div
                        className="
                            top-[15px]
                            absolute left-1/2  mt-1
                            -translate-x-1/2 min-w-[180px]
                            pt-8
                            pointer-events-none
                            group-hover:pointer-events-auto
                         z-2
                          "
                      >
                        <ul className="
                            opacity-0 translate-x-4
                            group-hover:opacity-100 group-hover:translate-x-0
                            transition-all duration-300 ease-out bg-black/40 backdrop-blur-[8px] text-white rounded-sm shadow-lg overflow-hidden
                          "
                        >
                          {item.children.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={langHref(sub.url, lang)}
                                prefetch={true}
                                onClick={(e) => handleNavClick(e, sub.url)}
                                className="
                                    block px-4 py-3 text-white text-sm
                                    hover:text-white/70 transition
                                  "
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </nav>
        </div>

        {/* RIGHT SIDE — lang switcher, log in, CTA */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-6">
          {/* Language Switcher — current flag only; hover (or tap/focus) lists the other
              languages with flag + name in the current language, like live caspeco.com */}
          <div ref={langRef} className="relative group">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={langOpen}
              aria-label={langName(lang)}
              title={langName(lang)}
              className="flex items-center cursor-pointer px-2 xl:px-3 py-4"
            >
              <LangFlag code={lang} />
            </button>

            <div
              className={`absolute -left-3 top-full z-50 pt-1 group-hover:pointer-events-auto group-focus-within:pointer-events-auto ${
                langOpen ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <ul
                className={`min-w-max py-2 rounded-2xl bg-white/85 backdrop-blur-[8px] shadow-lg transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 ${
                  langOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                }`}
              >
                {altLangs.map((altLang) => (
                  <li key={altLang}>
                    <Link
                      href={altLangUrls[altLang] || langHome(altLang)}
                      hrefLang={LOCALE_MAP[altLang]?.replace("_", "-")}
                      onClick={() => setLangOpen(false)}
                      className="flex items-center gap-2 px-4 py-1.5 text-[16px] font-semibold text-black hover:text-black/60 transition whitespace-nowrap"
                    >
                      <LangFlag code={altLang} />
                      {langName(altLang, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LOG IN — Theme Options log_in_text / log_in_url, hover dropdown from login_submenu (no arrow) */}
          {options?.log_in_text && (
            <div className="relative group">
              <LoginLink
                url={options.log_in_url}
                lang={lang}
                className="block py-4 px-1 xl:px-2 whitespace-nowrap text-[16px] xl:text-[18px] font-bold text-(--color-yellow) hover:text-(--color-yellow)/80 transition"
              >
                {options.log_in_text}
              </LoginLink>

              {loginItems.length > 0 && (
                <div className="absolute right-0 top-full z-2 pt-1 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                  <ul className="min-w-40 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 ease-out bg-black/40 backdrop-blur-sm rounded-sm shadow-lg overflow-hidden">
                    {loginItems.map((item, i) => (
                      <li key={i}>
                        <LoginLink
                          url={item.link_url}
                          lang={lang}
                          className="block px-4 py-3 text-sm text-white hover:text-white/70 transition whitespace-nowrap"
                        >
                          {item.link_text}
                        </LoginLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* CTA BUTTON */}
          {!options?.button_text || !options?.button_url ? (
            // SKELETON PLACEHOLDER (prevents jump)
            <div className="w-[135px] h-[42px] rounded-full bg-white/20 animate-pulse"></div>
          ) : (
            <Link
              href={langHref(options.button_url, lang)}
              onClick={(e) => handleNavClick(e, options.button_url)}
              className="inline-flex items-center justify-center select-none
                    rounded-full px-6 xl:px-8 py-3 text-(--color-grey-dark) hover:text-white
                    text-[14px] font-extrabold whitespace-nowrap
                    transition-colors
                    bg-(--color-yellow) duration-100 ease-out"
            >
              {options.button_text}
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-3xl text-white"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
        {/* MOBILE SLIDE-IN MENU */}
        {mobileOpen && (
          <div className="fixed h-screen inset-0 z-60 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => { setMobileOpen(false); setOpenSubmenu(null); }}>
            <div className="absolute right-0 top-0 h-full w-72 bg-(--color-brand) shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* HEADER */}
              <div className="p-6 flex items-center justify-between">
                <span className="text-white font-semibold">Menu</span>
                <button
                  className="text-white text-3xl"
                  onClick={() => {
                    setMobileOpen(false);
                    setOpenSubmenu(null);
                  }}
                >
                  ✕
                </button>
              </div>

              {/* CONTENT (SLIDING PANELS) */}
              <div className="relative flex-1 overflow-hidden px-6">
                {/* MAIN MENU PANEL */}
                <div
                  className={`absolute inset-0 flex flex-col gap-5 transition-transform duration-300 ${
                    openSubmenu ? "-translate-x-full" : "translate-x-0"
                  }`}
                >
                  {navItems.map((item) => {
                    const hasChildren = item.children?.length > 0;

                    const parentHref = langHref(item.url, lang);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        {/* Parent link */}
                        <Link
                          href={parentHref}
                          prefetch={true}
                          className="text-white text-lg px-6"
                          onClick={(e) => handleNavClick(e, item.url, true)}
                        >
                          {item.title}
                        </Link>

                        {/* Arrow → open submenu */}
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={() => setOpenSubmenu(item.id)}
                            className="mr-6"
                          >
                            <Image
                              src={DownSvg}
                              alt="arrow"
                              width={16}
                              height={16}
                              className="-rotate-90"
                            />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* SUBMENU PANEL */}
                {navItems.map((item) => {
                  if (openSubmenu !== item.id) return null;

                  return (
                    <div
                      key={`submenu-${item.id}`}
                      className="absolute inset-0 flex flex-col gap-5 transition-transform duration-300 translate-x-0 px-6"
                    >
                      {/* Back */}
                      <button
                        className="text-white/80 text-sm flex items-center gap-2"
                        onClick={() => setOpenSubmenu(null)}
                      >
                        <Image
                          src={DownSvg}
                          alt="arrow"
                          width={16}
                          height={16}
                          className="rotate-90"
                        />{" "}
                        Back
                      </button>

                      {/* Parent title */}
                      <Link
                        href={langHref(item.url, lang)}
                        className="text-white text-lg font-semibold"
                        onClick={(e) => handleNavClick(e, item.url, true)}
                      >
                        {item.title}
                      </Link>

                      {/* Children */}
                      <div className="mt-2 flex flex-col gap-4">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={langHref(sub.url, lang)}
                            prefetch={true}
                            className="text-white/80 text-base hover:text-white transition"
                            onClick={(e) => handleNavClick(e, sub.url, true)}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FOOTER (STATIC) */}
              <div className="p-6 border-t border-white/10 flex flex-col gap-4">
                {/* Language Switcher */}
                <div className="flex flex-col gap-3 mb-2">
                  <span className="flex items-center gap-2 text-white font-semibold">
                    <LangFlag code={lang} />
                    {langName(lang)}
                  </span>
                  {altLangs.map((altLang) => (
                    <Link
                      key={altLang}
                      href={altLangUrls[altLang] || langHome(altLang)}
                      hrefLang={LOCALE_MAP[altLang]?.replace("_", "-")}
                      className="flex items-center gap-2 text-white/80 hover:text-white transition"
                      onClick={() => {
                        setMobileOpen(false);
                        setOpenSubmenu(null);
                      }}
                    >
                      <LangFlag code={altLang} />
                      {langName(altLang, lang)}
                    </Link>
                  ))}
                </div>

                {/* Log in + its submenu links */}
                {options?.log_in_text && (
                  <div className="flex flex-col gap-2">
                    <LoginLink
                      url={options.log_in_url}
                      lang={lang}
                      className="text-[16px] font-bold text-(--color-yellow) hover:text-(--color-yellow)/80 transition"
                      onClick={() => {
                        setMobileOpen(false);
                        setOpenSubmenu(null);
                      }}
                    >
                      {options.log_in_text}
                    </LoginLink>
                    {loginItems.map((item, i) => (
                      <LoginLink
                        key={i}
                        url={item.link_url}
                        lang={lang}
                        className="pl-3 text-white/80 text-sm hover:text-white transition"
                        onClick={() => {
                          setMobileOpen(false);
                          setOpenSubmenu(null);
                        }}
                      >
                        {item.link_text}
                      </LoginLink>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {options?.button_text && (
                  <Link
                    href={langHref(options.button_url, lang)}
                    className="inline-flex items-center justify-center select-none
                      rounded-full bg-(--color-yellow) px-8 py-3 text-(--color-grey-dark)
                      text-[14px] font-extrabold transition-colors duration-100 ease-out
                      hover:text-white w-fit"
                    onClick={(e) => handleNavClick(e, options.button_url, true)}
                  >
                    {options.button_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
