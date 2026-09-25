// src/components/major/Header.jsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import DownSvg from "../../../public/down-arrow.svg";
import { getMenu, getThemeOptions, getEntryTranslations } from "@/lib/api";
import { DEFAULT_LANG, SUPPORTED_LANGS, langHref, langHome } from "@/config";

export default function Header({
  lang = DEFAULT_LANG,
  currentSlug = "",
  entryType = "page",
  pathPrefix = "",
  entryId = null,
  prefetchedMenu = null,
  prefetchedOptions = null,
  logoUrl = "",
}) {
  const [menu, setMenu] = useState(prefetchedMenu);
  const [options, setOptions] = useState(prefetchedOptions);
  const altLangs = SUPPORTED_LANGS.filter((l) => l !== lang);
  const [altLangUrls, setAltLangUrls] = useState(
    Object.fromEntries(altLangs.map((l) => [l, langHome(l)]))
  );
  const isLoading = !menu;
  const [scrolled, setScrolled] = useState(false);

  // Nav items come from the ACF "mega_menu" repeater when it has real
  // entries (menu_title set) — each entry's columns/links/card drive the
  // dropdown. Falls back to the plain WP menu (no dropdown) otherwise.
  const megaMenuItems = (options?.mega_menu || []).filter((entry) => entry.menu_title);
  const navItems = megaMenuItems.length > 0
    ? megaMenuItems.map((entry, i) => {
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
      })
    : (menu?.main || []).map((item) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        columns: null,
        card: null,
        sideImage: null,
        children: item.children || [],
      }));

  // Only fetch client-side if no prefetched data was provided
  useEffect(() => {
    if (prefetchedMenu) return;
    async function loadData() {
      try {
        const [menuData, themeOptions] = await Promise.all([
          getMenu(lang),
          getThemeOptions(lang),
        ]);
        setMenu(menuData);
        setOptions(themeOptions || {});
      } catch {
        setMenu([]);
        setOptions({});
      }
    }
    loadData();
  }, [lang, prefetchedMenu]);

  // Header starts transparent; the dark blurred overlay fades in once the
  // page has scrolled.
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const headerClasses = `fixed top-0 w-full z-50 text-(--color-white) transition-[background-color,backdrop-filter] duration-300 ${
    scrolled ? "backdrop-blur-[8px] bg-(--color-black)/40" : "bg-transparent"
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
  }, [lang, currentSlug, entryType, pathPrefix, entryId]);

  return (
    <header className={headerClasses}>
      <div className="w-full px-6 lg:px-[120px] py-4 lg:py-0 lg:h-[84px] flex items-center justify-between relative">
        {/* LOGO + DESKTOP LINKS */}
        <div className="flex items-center gap-8 lg:gap-16">
          <Link
            href={langHome(lang)}
            className="flex relative h-8 w-[100px] lg:h-[26px] lg:w-[170px]"
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
            <ul className="flex items-center gap-12 relative">
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
                      className="text-(--color-white)/90 hover:text-(--color-white) relative z-9 text-[18px] font-bold transition leading-[18px] flex items-center gap-2"
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
                            transition-all duration-300 ease-out bg-(--color-white) text-(--color-black) rounded-sm shadow-lg overflow-hidden
                            flex
                          "
                        >
                          <div className="flex flex-1 divide-x divide-(--color-black)/10">
                            {item.columns.map((col, ci) => (
                              <ul key={ci} className="min-w-[180px] py-2">
                                {(col.links || []).map((link, li) => (
                                  <li key={li}>
                                    <Link
                                      href={langHref(link.url?.url || "#", lang)}
                                      prefetch={true}
                                      onClick={(e) => handleNavClick(e, link.url?.url)}
                                      target={link.url?.target || undefined}
                                      className="block px-4 py-3 text-(--color-black) text-sm hover:text-(--color-black)/70 transition"
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ))}
                          </div>

                          {item.card && (
                            <div className="w-[220px] shrink-0 bg-(--color-black)/5 p-5 flex flex-col gap-2">
                              {item.sideImage && (
                                <div className="relative w-full h-[100px] mb-2">
                                  <Image src={item.sideImage} alt="" fill className="object-cover rounded-sm" />
                                </div>
                              )}
                              <p className="font-bold text-sm">{item.card.title}</p>
                              {item.card.description && (
                                <p className="text-xs text-(--color-black)/70">{item.card.description}</p>
                              )}
                              {item.card.button_link?.url && (
                                <Link
                                  href={langHref(item.card.button_link.url, lang)}
                                  target={item.card.button_link.target || undefined}
                                  className="mt-2 text-sm font-bold text-(--color-petrol) hover:underline"
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
                            transition-all duration-300 ease-out bg-(--color-white) text-(--color-black) rounded-sm shadow-lg overflow-hidden
                          "
                        >
                          {item.children.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={langHref(sub.url, lang)}
                                prefetch={true}
                                onClick={(e) => handleNavClick(e, sub.url)}
                                className="
                                    block px-4 py-3 text-(--color-black) text-sm
                                    hover:text-(--color-black)/70 transition
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
        <div className="hidden lg:flex items-center gap-6">
          {/* Language Switcher */}
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-2 cursor-pointer px-4 py-4 rounded-sm text-sm leading-3.5 text-(--color-white) transition"
            >
              <span>{lang.toUpperCase()}</span>

              <span
                className={`transition-transform duration-300 ${
                  langOpen ? "rotate-180" : ""
                }`}
              >
                <Image src={DownSvg} alt="arrow" width={10} height={10} />
              </span>
            </button>

            {langOpen && (
              <div
                className="absolute right-0 mt-2 min-w-full rounded-sm border border-[#FFFFFF33] shadow-lg overflow-hidden z-50"
              >
                {altLangs.map((altLang) => (
                  <Link
                    key={altLang}
                    href={altLangUrls[altLang] || langHome(altLang)}
                    onClick={() => setLangOpen(false)}
                    className="block px-4 py-3 text-sm text-(--color-black) bg-(--color-white) hover:text-(--color-black)/70 transition whitespace-nowrap"
                  >
                    {altLang.toUpperCase()}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* LOG IN LINK */}
          {options?.login_text && options?.login_url && (
            <Link
              href={options.login_url}
              className="px-2 text-[18px] font-bold text-(--color-yellow) hover:text-(--color-yellow)/80 transition"
            >
              {options.login_text}
            </Link>
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
                    rounded-full px-8 py-3 text-(--color-black)
                    text-[14px] font-extrabold whitespace-nowrap
                    transition-colors duration-300
                    bg-(--color-yellow) hover:bg-(--color-yellow)/90"
            >
              {options.button_text}
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-3xl text-(--color-white)"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
        {/* MOBILE SLIDE-IN MENU */}
        {mobileOpen && (
          <div className="fixed h-[100vh] inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => { setMobileOpen(false); setOpenSubmenu(null); }}>
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
                <div className="flex flex-wrap gap-4 mb-2">
                  {altLangs.map((altLang) => (
                    <Link
                      key={altLang}
                      href={altLangUrls[altLang] || langHome(altLang)}
                      className="text-white/80 hover:text-white transition"
                      onClick={() => {
                        setMobileOpen(false);
                        setOpenSubmenu(null);
                      }}
                    >
                      {altLang.toUpperCase()}
                    </Link>
                  ))}
                </div>

                {/* Log in */}
                {options?.login_text && options?.login_url && (
                  <Link
                    href={options.login_url}
                    className="text-[16px] font-bold text-(--color-yellow) hover:text-(--color-yellow)/80 transition"
                    onClick={() => {
                      setMobileOpen(false);
                      setOpenSubmenu(null);
                    }}
                  >
                    {options.login_text}
                  </Link>
                )}

                {/* CTA */}
                {options?.button_text && (
                  <Link
                    href={langHref(options.button_url, lang)}
                    className="inline-flex items-center justify-center select-none
                      rounded-full bg-(--color-yellow) px-8 py-3 text-(--color-black)
                      text-[14px] font-extrabold transition-colors duration-300
                      hover:bg-(--color-yellow)/90 w-fit"
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
