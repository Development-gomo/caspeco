// src/components/sections/home/HomeCasperAI.jsx
// ACF layout: home_ai_section — "We built you a business partner" (Casper AI).
// The chat card is built from text fields (chat_question / chat_answer /
// input_placeholder) so it is translated per language. If those are empty and
// a section_image is set, that image is shown in its place instead.

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import AvatarLarge from "../../../../public/icons/home/ai-avatar.svg";
import AvatarSmall from "../../../../public/icons/home/ai-avatar-small.svg";
import SendIcon from "../../../../public/icons/home/send.svg";
import { DEFAULT_LANG, langHref } from "@/config";
import { mediaUrl, toHtml } from "@/lib/content";

// The Figma robot is a Font Awesome glyph (not an exported asset), so it is drawn here.
function RobotGlyph({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden className="absolute inset-0 m-auto">
      <rect x="3.5" y="6" width="13" height="10" rx="2.5" stroke="#151411" strokeWidth="1.6" />
      <circle cx="7.5" cy="11" r="1.3" fill="#151411" />
      <circle cx="12.5" cy="11" r="1.3" fill="#151411" />
      <path d="M10 6V3.2" stroke="#151411" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="2.6" r="1.1" fill="#151411" />
      <path d="M1.5 10v3M18.5 10v3" stroke="#151411" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChatCard({ question, answer, placeholder, href }) {
  return (
    <div
      className="relative w-full max-w-[570px] rounded-[8px] p-4 sm:px-7 sm:pt-[30px] sm:pb-[29px] shadow-[0px_5.333px_16px_0px_rgba(0,0,0,0.16)] backdrop-blur-md border border-white/10"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 0% 0%, rgba(1,2,2,0.4) 0%, rgba(255,255,255,0.2) 49%, rgba(11,35,49,0.4) 100%)",
      }}
    >
      {question && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="w-fit max-w-[336px] rounded-[4px] bg-[rgba(0,0,0,0.39)] px-4 py-[13px] text-[15px] sm:text-[16px] leading-5 tracking-[-0.64px] text-(--color-white)"
        >
          {question}
        </motion.p>
      )}

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="relative mt-[43px] ml-auto w-full max-w-[336px]"
        >
          <span className="absolute -left-[14px] -top-[5px] size-[21px] opacity-80">
            <Image src={AvatarSmall} alt="" width={21} height={21} />
            <RobotGlyph size={10} />
          </span>
          <p
            className="rounded-[4px] bg-[#29363d] px-[11px] pt-[13px] pb-4 text-[15px] sm:text-[16px] leading-5 tracking-[-0.64px] text-(--color-white)"
            dangerouslySetInnerHTML={{ __html: toHtml(answer) }}
          />
        </motion.div>
      )}

      <Link
        href={href || "#"}
        aria-label={placeholder || undefined}
        className="mt-[55px] flex h-[54px] items-center gap-[11px] rounded-[33.5px] bg-[#2b373e] pl-[6px] pr-4 transition hover:bg-[#33424a]"
      >
        <span className="relative size-[42px] shrink-0">
          <Image src={AvatarLarge} alt="" width={42} height={42} />
          <RobotGlyph size={20} />
        </span>
        <span className="flex-1 truncate text-[18px] sm:text-[20px] tracking-[-0.8px] text-[rgba(251,250,249,0.66)]">{placeholder}</span>
        <Image src={SendIcon} alt="" width={26} height={26} className="shrink-0" />
      </Link>
    </div>
  );
}

export default function HomeCasperAI({ data, lang = DEFAULT_LANG }) {
  const { sub_heading, heading, short_text, cta_text, cta_url, chat_question, chat_answer, input_placeholder } = data || {};
  if (!heading) return null;

  const bgImage = mediaUrl(data?.bg_image);
  const sectionImage = data?.section_image;
  const hasChat = chat_question || chat_answer || input_placeholder;
  const href = cta_url ? langHref(cta_url, lang) : "";

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-[83px]" style={data?.bg_color ? { background: data.bg_color } : undefined}>
      {bgImage && (
        <div className="absolute -inset-6" aria-hidden>
          <Image src={bgImage} alt="" fill sizes="100vw" className="object-cover blur-[12.4px]" />
        </div>
      )}

      <div className="cs-container relative flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-start text-(--color-light-grey) lg:max-w-[507px]">
          {sub_heading && <p className="italic text-[18px] lg:text-[20px] leading-[26px] tracking-[-0.8px] text-(--color-white)">{sub_heading}</p>}
          <h2 className="cs-h3 cs-highlight mt-0" dangerouslySetInnerHTML={{ __html: toHtml(heading) }} />
          {short_text && (
            <p
              className="mt-5 font-bold text-[18px] lg:text-[20px] leading-6 tracking-[-0.4px] lg:max-w-[446px]"
              dangerouslySetInnerHTML={{ __html: toHtml(short_text) }}
            />
          )}
          {cta_text && href && (
            <CtaButton variant="outline-light" href={href} className="mt-10 lg:mt-[44px]">
              {cta_text}
            </CtaButton>
          )}
        </div>

        {hasChat ? (
          <div className="w-full lg:mt-[26px] lg:w-[570px] shrink-0">
            <ChatCard question={chat_question} answer={chat_answer} placeholder={input_placeholder} href={href} />
          </div>
        ) : (
          mediaUrl(sectionImage) && (
            <div className="relative w-full lg:w-[570px] aspect-[570/347] shrink-0 lg:mt-[26px]">
              <Image src={mediaUrl(sectionImage)} alt={sectionImage?.alt || ""} fill sizes="(min-width: 1024px) 570px, 100vw" className="object-contain" />
            </div>
          )
        )}
      </div>
    </section>
  );
}
