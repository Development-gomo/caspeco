// src/components/sections/About.jsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ArrowSvg from "../../../../public/right-arrow.svg";

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

  return (
    <section id="about-section" className="about-section relative overflow-hidden bg-(--color-warm-stone)">
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
        <div className="about-diagonal-panel relative z-10 w-full lg:w-[52%] bg-(--color-warm-stone) px-6 lg:pr-16 lg:pl-31 py-12 lg:py-0 order-2 lg:order-1 flex flex-col justify-center">
          {/* SUB HEADING */}
            {sub_heading && (
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
              <span className="subheading-label">{sub_heading}</span>
            </motion.div>
          )}

          {/* HEADING */}
          {heading && (
            <motion.div
              className="about-panel-heading text-(--color-navy) max-w-[420px] mb-4"
              dangerouslySetInnerHTML={{ __html: heading }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            />
          )}

          {/* CONTENT HEADING (regular paragraph) */}
          {content_heading && (
            <p className="body-text max-w-[400px] mb-4">{content_heading}</p>
          )}

          {/* SHORT TEXT (bold paragraph) */}
          {short_text && (
            <div
              className="body-text font-semibold max-w-[420px] mb-6"
              dangerouslySetInnerHTML={{ __html: short_text }}
            />
          )}

          {/* CTA BUTTON */}
          {cta_text && cta_url && (
            <Link
              href={cta_url}
              className="
                  gap-3 group relative inline-flex items-center select-none
                  rounded-sm bg-(--color-brand) px-6 py-4 text-white
                  transition-all duration-300 hover:bg-(--color-brand)
                  w-[130px] overflow-hidden
                "
            >
              {/* LEFT SLOT (dot area, fixed width) */}
              <span className="relative w-2 h-2 flex items-center justify-center">
                <span
                  className="absolute h-2 w-2 rounded-full bg-(--color-mint)
                      transition-all duration-300 ease-out
                      group-hover:opacity-0 group-hover:-translate-x-1"
                ></span>
              </span>

              {/* TEXT (slides left on hover) */}
              <span
                className="
                    flex-1 text-[16px] leading-none
                    transition-all duration-300 ease-out
                    group-hover:-translate-x-4
                    whitespace-nowrap"
              >
                {cta_text}
              </span>

              {/* RIGHT SLOT (arrow area, fixed width) */}
              <span className="relative w-4 flex items-center justify-center">
                <span
                  className="
                      w-4 absolute text-[16px]
                      opacity-0 -translate-x-4
                      transition-all duration-300 ease-out
                      group-hover:opacity-100 group-hover:-translate-x-2
                    "
                >
                  <Image src={ArrowSvg} alt="arrow" width={13} height={13} />
                </span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
