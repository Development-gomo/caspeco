"use client";

import { DEFAULT_LANG, langHref } from "@/config";
import CtaButton from "@/components/ui/CtaButton";
import { hasText } from "@/lib/content";

export default function CaseCtaBanner({ data, lang = DEFAULT_LANG }) {
  if (!data) return null;
  const { heading, short_text, cta_text, cta_url } = data;
  const hasHeading = hasText(heading);
  const hasShortText = hasText(short_text);
  const hasCta = !!(cta_text && cta_url);
  if (!hasHeading && !hasShortText && !hasCta) return null;
  return (
    <section className="py-15 md:py-30 bg-black text-white">
      <div className="web-width px-6">
        {/* TWO COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row md:gap-27">
          {/* LEFT META COLUMN */}
          {hasHeading && (
          <div className="md:w-[55%]">
            {/* LEFT – BIG HEADING */}
            {hasHeading && (
              <h2
                className="text-[36px] md:text-[64px] leading-[44px] md:leading-[70px] font-medium"
                dangerouslySetInnerHTML={{ __html: heading }}
              />
            )}
          </div>
          )}
          {/* RIGHT – TEXT + CTA */}
          {(hasShortText || hasCta) && (
          <div className="md:w-[45%]">
            {hasShortText && <p className="text-white text-[18px] mb-6">{short_text}</p>}

            {hasCta && (
              <CtaButton href={langHref(cta_url, lang)}>{cta_text}</CtaButton>
            )}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
