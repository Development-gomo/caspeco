// src/components/sections/icp/PeopleCards.jsx
// ACF layout: people_section — Figma "Your people in Sweden and Norway": heading and up to
// 4 cards (photo, petrol location tag, name with a yellow rule, role).
// Figma "Person" (324:6807): 303×308, radius 8, #FDFDFD, no shadow, no hover; photo 303×172
// (Fill), details padding 24 / gap 16. The kontakt photos are portrait head shots (~5:7), so
// the crop is set to keep the face (eyes to chin) in the landscape box instead of the hair.

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { mediaUrl, rows, sectionBackground, toHtml } from "@/lib/content";

const GRADIENT = "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, #DADCDD 80.6%), #FFFFFF";

// joined: follows the Steps section inside the same Figma frame (100px gap, shared gradient)
export default function PeopleCards({ data, joined = false }) {
  const people = rows(data?.people).filter((p) => p.name);
  const { heading } = data || {};
  if (!heading && people.length === 0) return null;

  return (
    <section className={`pb-18 lg:pb-36 ${joined ? "pt-14 lg:pt-[100px]" : "pt-18 lg:pt-36"}`} style={joined ? undefined : sectionBackground(data, { background: GRADIENT })}>
      <div className="cs-container flex flex-col gap-10 lg:gap-16">
        {heading && <Reveal as="h2" className="cs-h3 cs-highlight cs-rich font-extrabold! text-black" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />}

        {people.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((person, i) => {
              const photo = mediaUrl(person.photo);
              return (
                <div key={i} className="overflow-hidden rounded-[8px] bg-(--color-light-grey)">
                  <div className="relative aspect-[303/172] overflow-hidden bg-(--color-grey-medium)">
                    {photo && (
                      <Image
                        src={photo}
                        alt={person.photo?.alt || person.name}
                        fill
                        sizes="(min-width: 1024px) 303px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-[50%_42%]"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-4 p-6">
                    {person.tag && <p className="font-bold text-[14px] leading-4 tracking-[1px] text-(--color-petrol)">{person.tag}</p>}
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-[3px] shrink-0 rounded-[10px] bg-(--color-yellow)" aria-hidden />
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[22px] lg:text-[24px] leading-7 tracking-[-0.48px] text-(--color-grey-dark)">{person.name}</span>
                        {person.role && <span className="font-medium text-[16px] lg:text-[18px] leading-6 tracking-[0.15px] text-(--color-grey-dark)">{person.role}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
