"use client";

import CtaButton from "@/components/ui/CtaButton";

export default function CaseIntroduction({ data }) {
  if (!data) return null;

  const {
    sub_heading,
    heading,
    client_name,
    services_offered,
    category,
    date,
    content_heading,
    short_text,
    cta_text,
    cta_url,
  } = data;

  const splitLines = (text = "") =>
    text
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

  return (
    <section id="next" className="pt-12 md:pt-30 web-width px-6">
      {/* SUB HEADING */}
      {sub_heading && (
        <div className="flex items-center gap-2 mb-2 md:mb-4">
          <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
          <span className="subheading-label uppercase">{sub_heading}</span>
        </div>
      )}

      {/* MAIN HEADING */}
      {heading && (
        <div
          className="section-heading mb-6 md:mb-14 max-w-[1040px]"
          dangerouslySetInnerHTML={{ __html: heading }}
        />
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row md:gap-25">
        {/* LEFT META COLUMN */}
        <div className="md:w-[35%]"></div>
        <div className="md:w-[65%] flex flex-col lg:flex-row md:gap-25">
          <div className="md:w-[24%] space-y-6 text-gray-500">
            {/* Client */}
            {client_name && (
              <div>
                <p className="uppercase text-xs tracking-widest mb-2">Client</p>
                <p className="text-black font-medium">{client_name}</p>
              </div>
            )}

            {/* Services */}
            {services_offered && (
              <div>
                <p className="uppercase text-xs tracking-widest mb-2">
                  Services
                </p>
                <ul className="space-y-1">
                  {splitLines(services_offered).map((item, i) => (
                    <li
                      key={i}
                      className="text-black font-medium"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Categories */}
            {category && (
              <div>
                <p className="uppercase text-xs tracking-widest mb-2">
                  Categories
                </p>
                <ul className="space-y-1">
                  {splitLines(category).map((item, i) => (
                    <li
                      key={i}
                      className="text-black font-medium"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Date */}
            {date && (
              <div>
                <p className="uppercase text-xs tracking-widest mb-2">Date</p>
                <p className="text-black font-medium">{date}</p>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT COLUMN */}
          <div className="md:w-[76%] mt-10 lg:mt-0">
            {/* Content Heading */}
            {content_heading && (
              <h3 className="content-heading mb-6">{content_heading}</h3>
            )}

            {/* Body */}
            {short_text && (
              <div
                className="body-text max-w-[520px] mb-6"
                dangerouslySetInnerHTML={{ __html: short_text }}
              />
            )}

            {/* CTA */}
            {cta_text && cta_url && (
              <CtaButton href={cta_url}>{cta_text}</CtaButton>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
