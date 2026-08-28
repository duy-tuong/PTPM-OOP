"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { AboutHeroVisual } from "@/components/about/AboutHeroVisual";
import { ABOUT_HERO } from "@/lib/constants/about";

// Hero "Journey into the story" - client component vì cần scroll-linked motion (heading scale+fade,
// background parallax nhẹ khi cuộn qua chính section này - dùng useScroll(target:ref) giới hạn trong
// phạm vi Hero, KHÔNG phải window scroll toàn trang). Nội dung 100% tĩnh (ABOUT_HERO), không nhận props.
export function AboutHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

  const headingOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const headingScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-5 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          y: shouldReduceMotion ? undefined : bgY,
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16 lg:px-8">
        <motion.div
          style={shouldReduceMotion ? undefined : { opacity: headingOpacity, scale: headingScale }}
          className="text-center lg:text-left"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold tracking-[0.2em] text-primary uppercase"
          >
            {ABOUT_HERO.label}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-heading mt-4 text-4xl leading-tight font-bold text-balance text-foreground sm:text-5xl lg:text-6xl"
          >
            {ABOUT_HERO.heading[0]}
            <br />
            {ABOUT_HERO.heading[1]}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0"
          >
            {ABOUT_HERO.description}
          </motion.p>
        </motion.div>

        <AboutHeroVisual />
      </div>
    </section>
  );
}
