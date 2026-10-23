// src/components/sections/icp/ContactRep.jsx
// ACF layout: contact_rep_section — Figma "Let's talk about the bigger picture": darkened
// photo background; left: heading, text and the sales rep (photo with a glass name bar);
// right: the contact form card (ContactRepForm).
// ICP pages (contact_form_section): `rep` ({ name, role, photo }) comes from the selected
// team member and `form` is the CF7 / HubSpot form rendered in the card instead.

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ContactRepForm from "./ContactRepForm";
import { DEFAULT_LANG } from "@/config";
import { mediaUrl, toHtml } from "@/lib/content";

export default function ContactRep({ data, lang = DEFAULT_LANG, rep, form }) {
  const { heading, short_text } = data || {};
  if (!heading) return null;
  const bg = mediaUrl(data?.bg_image);
  const rep_name = rep?.name || data?.rep_name;
  const rep_role = rep?.role || data?.rep_role;
  const photo = rep?.photo || mediaUrl(data?.rep_photo);

  return (
    <section className="relative isolate overflow-hidden bg-(--color-black) py-18 lg:py-36" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {/* Figma: photo with 31.2px layer blur, no extra overlay */}
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 scale-110 object-cover blur-[31.2px]" />}

      <div className="cs-container flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <Reveal className="flex flex-col gap-10 text-(--color-white) lg:max-w-[549px]">
          <div className="flex flex-col gap-[30px]">
            <h2 className="cs-h2 cs-highlight cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            {short_text && <div className="cs-p1 cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {photo && (
            <figure className="relative aspect-[400/391] w-full max-w-[400px] overflow-hidden rounded-[8px] border-[3px] border-[#D8D8D8]">
              <Image src={photo} alt={rep_name || ""} fill sizes="400px" className="object-cover" />
              {(rep_name || rep_role) && (
                // Glass name bar (Figma "Representative details")
                // Figma "Representative details": #000@60%, radius 4, padding 16/24/16/28, 9px from the card edge
                <figcaption className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-3 rounded-[4px] bg-black/60 py-4 pr-6 pl-7">
                  <span className="h-12 w-[3px] shrink-0 rounded-[2px] bg-(--color-yellow)" aria-hidden />
                  <span className="flex flex-col gap-1">
                    {rep_name && <span className="font-bold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] text-white">{rep_name}</span>}
                    {rep_role && <span className="font-medium text-[14px] lg:text-[16px] leading-6 tracking-[0.15px] text-(--color-white)">{rep_role}</span>}
                  </span>
                </figcaption>
              )}
            </figure>
          )}
        </Reveal>

        {/* Figma "Contact form": 691 wide (overhangs the 1272 container by 32px), #FBFAF9, 1px #E2E8F0, shadow 0 2 9 #000@10% */}
        <Reveal x={40} y={0} delay={0.15} className="w-full rounded-[8px] border border-[#E2E8F0] bg-[#FBFAF9] p-6 shadow-[0px_2px_9px_rgba(0,0,0,0.1)] sm:p-10 lg:-mr-8 lg:w-[691px] lg:flex-none">
          {form || <ContactRepForm data={data} lang={lang} />}
        </Reveal>
      </div>
    </section>
  );
}
