// src/components/sections/HomeCounter.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { DEFAULT_LANG } from "@/config";
import CtaButton from "@/components/ui/CtaButton";

function AnimatedNumber({ value, duration = 2000 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const target = parseFloat(value) || 0;
    const isDecimal = value.toString().includes(".");
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function HomeCounter({ data, lang = DEFAULT_LANG }) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  if (!data) return null;

  const {
    sub_heading,
    heading,
    short_text,
    cta_text,
    cta_url,
    bg_image,
    counters = [],
  } = data;

  return (
    <section ref={sectionRef} id="caspecooration" className="relative w-full py-12 md:py-44 text-white overflow-hidden">

      {/* BACKGROUND IMAGE */}
      {bg_image?.url && (
        <motion.div className="absolute inset-0 -z-10" style={{ y: bgY, scale: 1.15 }}>
          <Image
            src={bg_image.url}
            alt="background"
            fill
            priority
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-(--color-navy)/85 via-(--color-navy)/75 to-(--color-navy)/65 -z-10"></div>


      <div className="web-width px-6 grid lg:grid-cols-2 gap-2 items-center">

        {/* LEFT CONTENT */}
        <div>

          {/* SUBHEADING */}
          {sub_heading && (
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="h-2 w-2 rounded-full bg-(--color-accent)"></span>
              <span className="subheading-label text-white">{sub_heading}</span>
            </motion.div>
          )}

          {/* MAIN HEADING */}
          <motion.div
            className="section-heading text-white mb-6"
            dangerouslySetInnerHTML={{ __html: heading }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          />

          {/* DESCRIPTION */}
          {short_text && (
            <div className="text-white max-w-[440px] mb-6"
              dangerouslySetInnerHTML={{ __html: short_text }}
            />
          )}

          {/* CTA BUTTON */}
          {cta_text && cta_url && (
            <CtaButton href={cta_url}>{cta_text}</CtaButton>
          )}
        </div>

        {/* RIGHT COUNTERS GRID */}
        <div className="grid grid-cols-2 gap-4 mt-8 lg:mt-0">
          {counters.map((item, i) => (
            <motion.div
              key={i}
              className="lg:max-w-[312px] p-4
                lg:px-8 lg:py-10 rounded-sm bg-(--color-brand)
                shadow-lg
              "
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              viewport={{ once: true }}
            >
              <p className="font-semibold text-[50px] leading-[68px] lg:text-[64px] lg:leading-[70px]">
                <AnimatedNumber value={item.number} />{item.suffix}<span className="text-(--color-accent)">{item.suffix_highlighted}</span>
              </p>
              <p className="text-white/80">
                {item.short_text}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
