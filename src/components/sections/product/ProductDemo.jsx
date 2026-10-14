// src/components/sections/product/ProductDemo.jsx
// ACF layout: product_demo_section — "Grow with Caspeco". Heading, text,
// USP rows with a yellow line marker, CTA, and a device group image that bleeds
// off the right edge on desktop (upload the full composition incl. the
// "Try it out!" annotation as one transparent image).
// Figma "Online order device group" Default → Variant2: hovering (desktop) or tapping
// the devices swaps to hover_image (the "order ready" notification state).

"use client";

import React from "react";
import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";
import Reveal from "@/components/ui/Reveal";
import UspLine from "../../../../public/icons/product/usp-line.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const GRADIENT = "linear-gradient(180deg, rgba(255,255,255,0.5) 0.94%, #dadcdd 80.71%)";

export default function ProductDemo({ data, lang = DEFAULT_LANG }) {
  const usps = rows(data?.usps).filter((u) => u.title);
  const { heading, short_text, cta_text, cta_url, image } = data || {};
  const hover = mediaUrl(data?.hover_image); // optional, cross-fades in on hover / tap
  const [active, setActive] = React.useState(false);
  if (!heading) return null;

  return (
    <section className="overflow-hidden py-18 lg:py-36" style={sectionBackground(data, { backgroundImage: GRADIENT })}>
      <div className="cs-container relative flex flex-col gap-12 lg:flex-row lg:items-center xl:min-h-[532px]">
        <Reveal className="flex flex-col items-start gap-4 lg:max-w-[488px] lg:shrink-0">
          <div className="flex flex-col gap-5">
            <h2 className="cs-h3 cs-highlight font-extrabold text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            {short_text && <div className="cs-p2 cs-rich text-(--color-grey-dark)" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {usps.length > 0 && (
            <ul className="my-2 flex flex-col">
              {usps.map((usp, i) => (
                <Reveal as="li" key={i} x={-16} y={0} delay={0.2 + i * 0.1} className="flex items-center gap-2.5 py-2.5">
                  <Image src={UspLine} alt="" width={6} height={33} className="shrink-0 self-stretch" />
                  <span className="flex flex-col text-(--color-grey-dark)">
                    <span className="font-extrabold text-[18px] leading-[1.1] tracking-[-0.36px]">{usp.title}</span>
                    {usp.text && <span className="text-[14px] leading-4 tracking-[-0.28px]">{usp.text}</span>}
                  </span>
                </Reveal>
              ))}
            </ul>
          )}

          {cta_text && cta_url && (
            <CtaButton href={langHref(cta_url.trim(), lang)} wrap className="max-w-full">
              {cta_text}
            </CtaButton>
          )}
        </Reveal>

        {mediaUrl(image) && (
          // Figma: 696×532 group starting at x=865 of the 1512 frame (745px into the content box)
          <Reveal
            x={60}
            y={0}
            duration={0.9}
            delay={0.15}
            {...(hover && {
              role: "button",
              tabIndex: 0,
              "aria-pressed": active,
              // mouse: hover in/out; touch & pen: tap toggles; keyboard: Enter / Space
              onPointerEnter: (e) => e.pointerType === "mouse" && setActive(true),
              onPointerLeave: (e) => e.pointerType === "mouse" && setActive(false),
              onPointerUp: (e) => e.pointerType !== "mouse" && setActive((v) => !v),
              onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive((v) => !v)),
            })}
            className={`relative aspect-[696/532] w-full max-w-[696px] self-center drop-shadow-[0px_2.3px_5.2px_rgba(0,0,0,0.1)] outline-none lg:flex-1 xl:absolute xl:top-1/2 xl:left-[769px] xl:w-[696px] xl:-translate-y-1/2 ${hover ? "cursor-pointer" : ""}`}
          >
            <Image
              src={mediaUrl(image)}
              alt={image?.alt || ""}
              fill
              sizes="(min-width: 1024px) 696px, 100vw"
              className={`object-contain object-left transition-opacity duration-500 ease-out ${active ? "opacity-0" : ""}`}
            />
            {hover && (
              // notification state settles in from slightly above (Figma Smart Animate)
              <Image
                src={hover}
                alt=""
                fill
                sizes="(min-width: 1024px) 696px, 100vw"
                className={`object-contain object-left transition-[opacity,translate] duration-500 ease-out ${active ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
              />
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
