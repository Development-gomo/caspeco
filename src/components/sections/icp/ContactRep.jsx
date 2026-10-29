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

// tone "light" (Page Builder contact_form_section): plain light page background, dark heading
// (#151411) and grey text (#3F3E3C) — no photo background
export default function ContactRep({ data, lang = DEFAULT_LANG, rep, form, tone = "dark" }) {
  const light = tone === "light";
  const { heading, short_text } = data || {};
  if (!heading) return null;
  const bg = light ? null : mediaUrl(data?.bg_image);
  const rep_name = rep?.name || data?.rep_name;
  const rep_role = rep?.role || data?.rep_role;
  const photo = rep?.photo || mediaUrl(data?.rep_photo);
  // optional italic eyebrow above the heading (Page Builder contact_form_section "Sub Heading"),
  // same style as the Quick contact sub heading (Regular Italic 24/28)
  const eyebrow = data?.eyebrow;

  return (
    // Figma 324:7454: #0B2533 under the blurred photo
    <section className={`relative isolate overflow-hidden py-18 max-md:py-16 lg:py-36 ${light ? "bg-(--color-light-grey)" : "bg-(--color-dark-petrol)"}`} style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {/* Figma: photo with 31.2px layer blur, no extra overlay */}
      {bg && <Image src={bg} alt="" fill sizes="100vw" className="-z-10 scale-110 object-cover blur-[31.2px]" />}

      {/* Figma mobile ("Let's talk … — Mobile"): heading → 20 → text → 32 → rep card → 32 → form card */}
      <div className="cs-container flex flex-col gap-12 max-md:gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
        <Reveal className={`flex flex-col gap-10 max-md:gap-8 lg:max-w-[549px] ${light ? "text-(--color-grey-dark)" : "text-(--color-white)"}`}>
          <div className="flex flex-col gap-[30px] max-md:gap-5">
            {eyebrow && <p className="-mb-3.5 italic text-[24px] leading-7 tracking-[-0.48px]">{eyebrow}</p>}
            <h2 className={`cs-h2 cs-highlight cs-rich ${light ? "text-(--color-black)" : ""}`} dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
            {short_text && <div className="cs-p1 cs-rich" dangerouslySetInnerHTML={{ __html: toHtml(short_text) }} />}
          </div>

          {photo && (
            <figure className="relative aspect-[400/391] max-md:aspect-[345/334] w-full max-w-[400px] max-md:max-w-none overflow-hidden rounded-[8px] border-[3px] border-[#D8D8D8]">
              <Image src={photo} alt={rep?.alt || rep_name || ""} fill sizes="400px" className="object-cover" />
              {(rep_name || rep_role) && (
                // Glass name bar (Figma "Representative details")
                // Figma "Representative details": #000@60%, radius 4, padding 16/24/16/28, 9px from the card edge
                // Figma mobile: 8 from the card edge, padding 14/16, rule 3×44
                <figcaption className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-3 rounded-[4px] bg-black/60 py-4 pr-6 pl-7 max-md:inset-x-[5px] max-md:bottom-[5px] max-md:px-4 max-md:py-3.5">
                  <span className="h-12 max-md:h-11 w-[3px] shrink-0 rounded-[2px] bg-(--color-yellow)" aria-hidden />
                  <span className="flex flex-col gap-1">
                    {rep_name && <span className="font-bold text-[18px] max-md:text-[20px] lg:text-[20px] leading-6 tracking-[-0.4px] text-white">{rep_name}</span>}
                    {rep_role && <span className="font-medium text-[14px] max-md:text-[16px] lg:text-[16px] leading-6 max-md:leading-5 tracking-[0.15px] max-md:tracking-normal text-(--color-white)">{rep_role}</span>}
                  </span>
                </figcaption>
              )}
            </figure>
          )}
        </Reveal>

        {/* Figma "Contact form": 691 wide (overhangs the 1272 container by 32px), padding 40, #FBFAF9,
            1px #E2E8F0 inside stroke (inset shadow, so the content stays 611 wide), shadow 0 2 9 #000@10% */}
        <Reveal x={40} y={0} delay={0.15} className="w-full rounded-[8px] bg-[#FBFAF9] p-6 shadow-[inset_0_0_0_1px_#E2E8F0,0px_2px_9px_rgba(0,0,0,0.1)] sm:p-10 max-md:p-5! lg:-mr-8 lg:w-[691px] lg:flex-none">
          {form || <ContactRepForm data={data} lang={lang} />}
        </Reveal>
      </div>
    </section>
  );
}
