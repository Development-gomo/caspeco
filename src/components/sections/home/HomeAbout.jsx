// src/components/sections/About.jsx

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import CtaButton from "@/components/ui/CtaButton";
import { hasText } from "@/lib/content";

export default function AboutUs({ data }) {
  if (!data) return null;

  const {
    sub_heading,
    heading,
    content_heading,
    short_text,
    cta_text,
    cta_url,
  } = data;
  const sectionImageUrl = data?.section_image?.url || "";
  const hasSub = hasText(sub_heading);
  const hasHeading = hasText(heading);
  const hasContentHeading = hasText(content_heading);
  const hasShort = hasText(short_text);
  const hasCta = hasText(cta_text) && cta_url;
  const hasPanel = hasSub || hasHeading || hasContentHeading || hasShort || hasCta;
  // nothing to show: no image and no text
  if (!sectionImageUrl && !hasPanel) return null;

  return (
    <section id="about-section" className="about-section relative overflow-hidden bg-(--color-light-grey)">
      <div className="relative flex flex-col lg:flex-row lg:min-h-[620px]">
        {/* RIGHT — IMAGE */}
        {sectionImageUrl && (
          <motion.div
            className="relative w-full h-[280px] lg:absolute lg:right-0 lg:top-0 lg:h-full lg:w-[66%] order-1 lg:order-2 overflow-hidden"
            initial={{ clipPath: "inset(0 0 0 100%)" }}
            whileInView={{ clipPath: "inset(0 0 0 0%)" }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              whileInView={{ scale: 1.08 }}
              transition={{ duration: 15, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Image
                src={sectionImageUrl}
                alt=""
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}

        {/* LEFT — DIAGONAL TEXT PANEL */}
        {hasPanel && (
        <div className="about-diagonal-panel relative z-10 w-full lg:w-[52%] bg-(--color-light-grey) px-6 lg:pr-16 lg:pl-31 py-12 lg:py-0 order-2 lg:order-1 flex flex-col justify-center">
          {/* SUB HEADING */}
            {hasSub && (
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="h-2 w-2 rounded-full bg-(--color-yellow)"></span>
              <span className="subheading-label">{sub_heading}</span>
            </motion.div>
          )}

          {/* HEADING */}
          {hasHeading && (
            <motion.div
              className="about-panel-heading text-black max-w-[420px] mb-4"
              dangerouslySetInnerHTML={{ __html: heading }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}

          {/* CONTENT HEADING (regular paragraph) */}
          {hasContentHeading && (
            <p className="body-text max-w-[400px] mb-4">{content_heading}</p>
          )}

          {/* SHORT TEXT (bold paragraph) */}
          {hasShort && (
            <div
              className="body-text font-semibold max-w-[420px] mb-6"
              dangerouslySetInnerHTML={{ __html: short_text }}
            />
          )}

          {/* CTA BUTTON */}
          {hasCta && (
            <CtaButton href={cta_url}>{cta_text}</CtaButton>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
