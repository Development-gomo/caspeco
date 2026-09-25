"use client";

import Image from "next/image";
import CtaButton from "@/components/ui/CtaButton";

export default function WhyChoose({ data }) {
  const {
    bg_image,
    sub_heading,
    heading,
    short_text,
    cta_text,
    cta_url,
    key_solutions = [],
  } = data;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image */}
      {bg_image?.url && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bg_image.url}
            alt="Why choose background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/00 -z-10" />
        </div>
      )}

      <div className="web-width px-6 py-15 md:py-[145px] text-white">
        <div className="grid lg:grid-cols-2 items-center">
          {/* LEFT CONTENT */}
          <div>
            {sub_heading && (
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
                <span className="subheading-label text-white ">
                  {sub_heading}
                </span>
              </div>
            )}

            {/* MAIN HEADING */}
            <div
              className="section-heading text-white mb-6"
              dangerouslySetInnerHTML={{ __html: heading }}
            />

            {/* DESCRIPTION */}
            {short_text && (
              <div
                className="text-white max-w-[420px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}

            {/* CTA BUTTON */}
            {cta_text && cta_url && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>

          {/* RIGHT GRID */}
          <div className="grid md:grid-cols-2 gap-4 mt-8 lg:mt-0">
            {key_solutions.map((item, index) => (
              <div key={index} className="lg:max-w-[312px] p-6 lg:px-8 lg:py-8 rounded-sm bg-(--color-brand)">
                {item.solution_icons?.url && (
                  <Image
                    src={item.solution_icons.url} alt={item.heading || "icon"} width={32} height={32} className="mb-8"/>
                )}
                {item.heading && (
                  <p className="text-[24px] font-[600] mb-3">{item.heading}</p>
                )}
                {item.short_text && (
                  <p className="text-white font-[500]">{item.short_text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
