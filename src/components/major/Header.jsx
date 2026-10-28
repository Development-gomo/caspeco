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

// ACF "Theme Settings - Menu" link values are plain text fields (menu_title_link, links[].url);
// the card's button_link is an ACF Link (array). Normalise any of them to a trimmed URL string,
// or "" when there is no real target ("#" placeholders included).
const urlOf = (v) => {
  const url = (typeof v === "string" ? v : v?.url || "").trim();
  return url === "#" ? "" : url;
};

// Every menu / log-in link: no URL → plain text (pointer kept — a parent still opens its
// dropdown on hover), absolute URL → a normal <a> (external portals such as cloud.caspeco.se),
// site path → <Link> with the language prefix. "#anchor" stays a same-page anchor.
function NavLink({ url, lang, className: baseClassName, onClick, target, children }) {
  const className = `cursor-pointer ${baseClassName}`;
  const href = urlOf(url);
  if (!href) return <span className={className}>{children}</span>;
  if (/^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href)) {
    return (
      <a href={href} target={target || undefined} rel={target === "_blank" ? "noopener noreferrer" : undefined} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={langHref(href, lang)} target={target || undefined} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

// layout_type → how many columns of the Columns repeater the dropdown shows
const LAYOUT_COLUMNS = { no_column: 0, one_column: 1, two_column: 2, three_column: 3 };

// Theme Settings - Menu → nav items. Empty rows, labels and cards are dropped so the markup
// never renders blank links or an empty card.
function menuItems(megaMenu) {
  return (Array.isArray(megaMenu) ? megaMenu : [])
    .filter((entry) => entry?.menu_title?.trim())
    .map((entry, i) => {
      const maxColumns = LAYOUT_COLUMNS[entry.layout_type] ?? 3; // older rows without layout_type
      const columns = (Array.isArray(entry.columns) ? entry.columns : [])
        .slice(0, maxColumns)
        .map((col) => {
          const links = (Array.isArray(col?.links) ? col.links : [])
            .filter((link) => link?.label?.trim())
            .map((link) => ({ label: link.label.trim(), url: urlOf(link.url) }));
          const c = col?.card;
          const button = c?.button_link && typeof c.button_link === "object" ? c.button_link : null;
          const card = c?.title?.trim()
            ? {
                title: c.title.trim(),
                description: c.description || "",
                button: urlOf(button) ? { url: urlOf(button), title: button.title || "", target: button.target || "" } : null,
              }
            : null;
          return { links, card };
        })
        .filter((col) => col.links.length > 0 || col.card);
      const side = entry.side_image;
      return {
        id: `mega-${i}`,
        title: entry.menu_title.trim(),
        url: urlOf(entry.menu_title_link),
        columns,
        card: columns.map((col) => col.card).find(Boolean) || null,
        sideImage: (typeof side === "string" ? side : side?.url) || null,
        links: columns.flatMap((col) => col.links),
      };
    });
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

  // Nav items from Theme Settings - Menu (mega_menu), normalised by menuItems() above
  const navItems = menuItems(options?.mega_menu);

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
    // mobile (< 768px, Figma "Top menu"): solid Casp black #151411 once scrolled, no blur
    scrolled ? "backdrop-blur-[8px] bg-black/40 max-md:backdrop-blur-none max-md:bg-(--color-black)" : "bg-transparent"
  }`;

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = React.useRef(null);

  function handleNavClick(e, rawUrl, closeMobile = false) {
    // same-page anchor ("#pricing", "/en/x#pricing" on that page): smooth-scroll instead of jumping
    const hash = rawUrl?.includes("#") ? "#" + rawUrl.split("#")[1] : "";
    if (hash.length > 1) {
      let el = null;
      try {
        el = document.querySelector(hash);
      } catch {
        el = null; // not a valid selector
      }
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    // any tap in the mobile menu closes it (was skipped for links without "#")
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
      {/* mobile (< 768px) = Figma "Top menu": 72px bar, 24px side padding, logo 115×18; tablet unchanged */}
      <div className="cs-container py-4 lg:py-0 lg:h-[84px] max-md:h-[72px] max-md:py-0 flex items-center justify-between relative">
        {/* LOGO + DESKTOP LINKS */}
        <div className="flex items-center gap-8 xl:gap-16">
          <Link
            href={langHome(lang)}
            className="flex relative h-8 w-[100px] max-md:h-[18px] max-md:w-[115px] lg:h-[22px] lg:w-[140px] xl:h-[26px] xl:w-[170px]"
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
                navItems.map((item) => {
                  const hasDropdown = item.columns.length > 0;
                  return (
                    <li key={item.id} className="relative group">
                      <NavLink
                        url={item.url}
                        lang={lang}
                        onClick={(e) => handleNavClick(e, item.url)}
                        className="text-(--color-light-grey) hover:opacity-70 focus-visible:opacity-70 relative z-9 text-[16px] xl:text-[18px] font-bold transition-opacity duration-300 ease-out leading-[18px] flex items-center gap-2 whitespace-nowrap"
                      >
                        {item.title}
                        {hasDropdown && (
                          <span className="transition-transform duration-300 group-hover:rotate-180" aria-hidden>
                            <Image src={DownSvg} alt="" width={10} height={10} />
                          </span>
                        )}
                      </NavLink>

                      {/* DROPDOWN — layout_type columns of links, optional card + side image */}
                      {hasDropdown && (
                        <div className="absolute left-1/2 top-[15px] z-2 mt-1 min-w-[180px] -translate-x-1/2 pt-8 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                          <div className="flex overflow-hidden rounded-sm bg-black/40 text-white shadow-lg backdrop-blur-[8px] opacity-0 translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0 group-focus-within:opacity-100 group-focus-within:translate-x-0">
                            <div className="flex flex-1 divide-x divide-white/10">
                              {item.columns.map((col, ci) =>
                                col.links.length > 0 ? (
                                  <ul key={ci} className="min-w-[180px] py-2">
                                    {col.links.map((link, li) => (
                                      <li key={li}>
                                        <NavLink
                                          url={link.url}
                                          lang={lang}
                                          onClick={(e) => handleNavClick(e, link.url)}
                                          className="block whitespace-nowrap px-4 py-3 text-sm text-white transition hover:text-white/70"
                                        >
                                          {link.label}
                                        </NavLink>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null
                              )}
                            </div>

                            {item.card && (
                              <div className="flex w-[220px] shrink-0 flex-col gap-2 bg-white/5 p-5">
                                {item.sideImage && (
                                  <div className="relative mb-2 h-[100px] w-full">
                                    <Image src={item.sideImage} alt="" fill sizes="180px" className="rounded-sm object-cover" />
                                  </div>
                                )}
                                <p className="text-sm font-bold">{item.card.title}</p>
                                {item.card.description && (
                                  <div className="cs-rich text-xs text-white/70" dangerouslySetInnerHTML={{ __html: item.card.description }} />
                                )}
                                {item.card.button && (
                                  <NavLink
                                    url={item.card.button.url}
                                    lang={lang}
                                    target={item.card.button.target}
                                    className="mt-2 text-sm font-bold text-(--color-yellow) hover:underline"
                                  >
                                    {item.card.button.title || "Learn more"}
                                  </NavLink>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })
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
              <NavLink
                url={options.log_in_url}
                lang={lang}
                className="block py-4 px-1 xl:px-2 whitespace-nowrap text-[16px] xl:text-[18px] font-bold text-(--color-yellow) hover:text-(--color-yellow)/80 transition"
              >
                {options.log_in_text}
              </NavLink>

              {loginItems.length > 0 && (
                <div className="absolute right-0 top-full z-2 pt-1 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                  <ul className="min-w-40 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 ease-out bg-black/40 backdrop-blur-sm rounded-sm shadow-lg overflow-hidden">
                    {loginItems.map((item, i) => (
                      <li key={i}>
                        <NavLink
                          url={item.link_url}
                          lang={lang}
                          className="block px-4 py-3 text-sm text-white hover:text-white/70 transition whitespace-nowrap"
                        >
                          {item.link_text}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* CTA BUTTON — hover matches the hero CtaButton (yellow → gold #C59A28, white label, 600 ms ease-out) */}
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
                    bg-(--color-yellow) hover:bg-(--color-gold) duration-600 ease-out"
            >
              {options.button_text}
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        {/* Figma mobile "Menu" (Closed): 36×25, three #FFC120 bars 3px tall, rounded, right-aligned 24 / 36 / 28 wide */}
        <div className="lg:hidden flex items-center gap-6">
          {/* Figma mobile "Top menu": Theme Options button_text / button_url as a #FFC120 text link
              (Bold 16/102%, -2%) 24px before the icon — below 768px only */}
          {options?.button_text && options?.button_url && (
            <Link
              href={langHref(options.button_url, lang)}
              onClick={(e) => handleNavClick(e, options.button_url)}
              className="hidden max-md:inline-block whitespace-nowrap text-[16px] font-bold leading-[16.32px] tracking-[-0.32px] text-(--color-yellow)"
            >
              {options.button_text}
            </Link>
          )}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            // md:h-9 keeps the tablet bar at its original 68px (the old ☰ glyph was 36px tall)
            className="flex cursor-pointer items-center justify-center md:h-9"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="36" height="25" viewBox="0 0 36 25" aria-hidden="true">
              <rect x="12" y="0" width="24" height="3" rx="1.5" fill="#FFC120" />
              <rect x="0" y="11" width="36" height="3" rx="1.5" fill="#FFC120" />
              <rect x="8" y="22" width="28" height="3" rx="1.5" fill="#FFC120" />
            </svg>
          </button>
        </div>
        {/* MOBILE SLIDE-IN MENU */}
        {mobileOpen && (
          <div className="fixed h-screen inset-0 z-60 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => { setMobileOpen(false); setOpenSubmenu(null); }}>
            <div className="absolute right-0 top-0 h-full w-72 bg-(--color-black) shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              {/* HEADER */}
              <div className="p-6 flex items-center justify-between">
                <span className="text-white font-semibold">Menu</span>
                {/* Figma mobile "Menu" (Open): the bars cross into a #FFC120 X */}
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex cursor-pointer items-center justify-center"
                  onClick={() => {
                    setMobileOpen(false);
                    setOpenSubmenu(null);
                  }}
                >
                  <svg width="36" height="27" viewBox="0 0 36 27" aria-hidden="true">
                    <path fill="#FFC120" d="M34.727.439a1.5 1.5 0 0 1 0 2.122L11.393 25.895a1.5 1.5 0 1 1-2.121-2.121L32.606.439a1.5 1.5 0 0 1 2.121 0Z" />
                    <path fill="#FFC120" d="M34.516 26.187a1.5 1.5 0 0 1-2.121 0L9.06 2.852A1.5 1.5 0 1 1 11.182.731l23.334 23.335a1.5 1.5 0 0 1 0 2.121Z" />
                  </svg>
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
                    const hasChildren = item.links.length > 0;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        {/* Parent: a link when it has a URL; otherwise tapping it opens its submenu */}
                        {item.url || !hasChildren ? (
                          <NavLink
                            url={item.url}
                            lang={lang}
                            className="text-white text-lg px-6"
                            onClick={(e) => handleNavClick(e, item.url, true)}
                          >
                            {item.title}
                          </NavLink>
                        ) : (
                          <button type="button" onClick={() => setOpenSubmenu(item.id)} className="cursor-pointer text-left text-white text-lg px-6">
                            {item.title}
                          </button>
                        )}

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
                      <NavLink
                        url={item.url}
                        lang={lang}
                        className="text-white text-lg font-bold"
                        onClick={(e) => handleNavClick(e, item.url, true)}
                      >
                        {item.title}
                      </NavLink>

                      {/* Children (all layout columns, in order) */}
                      <div className="mt-2 flex flex-col gap-4">
                        {item.links.map((link, li) => (
                          <NavLink
                            key={li}
                            url={link.url}
                            lang={lang}
                            className="text-white/80 text-base hover:text-white transition"
                            onClick={(e) => handleNavClick(e, link.url, true)}
                          >
                            {link.label}
                          </NavLink>
                        ))}
                        {item.card?.button && (
                          <NavLink
                            url={item.card.button.url}
                            lang={lang}
                            target={item.card.button.target}
                            className="text-base font-bold text-(--color-yellow)"
                            onClick={() => {
                              setMobileOpen(false);
                              setOpenSubmenu(null);
                            }}
                          >
                            {item.card.button.title || item.card.title}
                          </NavLink>
                        )}
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
                    <NavLink
                      url={options.log_in_url}
                      lang={lang}
                      className="text-[16px] font-bold text-(--color-yellow) hover:text-(--color-yellow)/80 transition"
                      onClick={() => {
                        setMobileOpen(false);
                        setOpenSubmenu(null);
                      }}
                    >
                      {options.log_in_text}
                    </NavLink>
                    {loginItems.map((item, i) => (
                      <NavLink
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
                      </NavLink>
                    ))}
                  </div>
                )}

                {/* CTA */}
                {options?.button_text && (
                  <Link
                    href={langHref(options.button_url, lang)}
                    className="inline-flex items-center justify-center select-none
                      rounded-full bg-(--color-yellow) px-8 py-3 text-(--color-grey-dark)
                      text-[14px] font-extrabold transition-colors duration-600 ease-out
                      hover:bg-(--color-gold) hover:text-white w-fit"
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
