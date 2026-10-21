// src/components/sections/icp/ContactRep.jsx
// ACF layout: contact_rep_section — Figma "Let's talk about the bigger picture": darkened
// photo background; left: heading, text and the sales rep (photo with a glass name bar);
// right: the contact form card (ContactRepForm).

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ContactRepForm from "./ContactRepForm";
import { DEFAULT_LANG } from "@/config";
import { mediaUrl, toHtml } from "@/lib/content";

export default function ContactRep({ data, lang = DEFAULT_LANG }) {
  const { heading, short_text, rep_name, rep_role } = data || {};
  if (!heading) return null;
  const bg = mediaUrl(data?.bg_image);
  const photo = mediaUrl(data?.rep_photo);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-18 lg:py-36" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden />

      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <Reveal className="flex flex-col gap-10 text-(--color-light-grey) lg:max-w-[549px]">
          <div className="flex flex-col gap-7">
            <h2 className="cs-h2 cs-highlight cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            {short_text && <div className="cs-p1 cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {photo && (
            <figure className="relative aspect-[400/391] w-full max-w-[400px] overflow-hidden rounded-[8px] border-[3px] border-white/70 shadow-[0px_4px_24px_rgba(0,0,0,0.3)]">
              <Image src={photo} alt={data?.rep_photo?.alt || rep_name || ""} fill sizes="400px" className="object-cover" />
              {(rep_name || rep_role) && (
                // Glass name bar (Figma "Representative details")
                <figcaption className="absolute inset-x-1.5 bottom-1.5 flex items-stretch gap-3 rounded-[4px] bg-(--color-grey-dark)/70 px-7 py-3.5 backdrop-blur-[10px]">
                  <span className="w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow)" aria-hidden />
                  <span className="flex flex-col">
                    {rep_name && <span className="font-bold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-white">{rep_name}</span>}
                    {rep_role && <span className="text-[14px] lg:text-[16px] leading-6 tracking-[0.15px] text-white/90">{rep_role}</span>}
                  </span>
                </figcaption>
              )}
            </figure>
          )}
        </Reveal>

        <Reveal x={40} y={0} delay={0.15} className="w-full rounded-[8px] bg-(--color-white) p-6 shadow-[0px_4px_24px_rgba(0,0,0,0.2)] sm:p-10 lg:max-w-[691px]">
          <ContactRepForm data={data} lang={lang} />
        </Reveal>
      </div>
    </section>
  );
}
