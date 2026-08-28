"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { ABOUT_TIMELINE } from "@/lib/constants/about";

// Timeline "Hành trình phát triển" - nội dung tĩnh 100% (ABOUT_TIMELINE), chỉnh trực tiếp trong
// lib/constants/about.ts nếu mốc thời gian thực tế khác. So le trái/phải ở desktop (>= lg), sụp về 1
// cột ở mobile. Năm có hiệu ứng "glitch" rất nhẹ (~350ms, chạy đúng 1 lần khi cuộn tới, KHÔNG lặp lại) -
// dùng motion.span whileInView với mảng keyframe x/opacity, không cần thư viện glitch riêng.
export function AboutTimeline() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Hành Trình Phát Triển</h2>
      </ScrollReveal>

      <div className="relative">
        <div
          aria-hidden
          className="absolute top-0 bottom-0 left-4 w-px bg-border lg:left-1/2 lg:-translate-x-1/2"
        />

        <div className="flex flex-col gap-8 lg:gap-12">
          {ABOUT_TIMELINE.map((milestone, index) => {
            const isRight = index % 2 === 1;
            return (
              <ScrollReveal key={milestone.year} direction={isRight ? "right" : "left"}>
                <div
                  className={cn(
                    "relative flex flex-col gap-3 pl-12 lg:flex-row lg:items-center lg:gap-8 lg:pl-0",
                    isRight && "lg:flex-row-reverse",
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute top-1 left-4 size-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background lg:left-1/2"
                  />

                  <div className={cn("lg:w-1/2", isRight ? "lg:pl-10 lg:text-left" : "lg:pr-10 lg:text-right")}>
                    <div className="glass-card rounded-2xl p-5">
                      <motion.span
                        className="font-heading inline-block text-2xl font-bold text-primary"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: [0, 1, 0.6, 1], x: [0, -3, 3, 0] }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.35 }}
                      >
                        {milestone.year}
                      </motion.span>
                      <h3 className="font-heading mt-1 text-lg font-semibold text-foreground">{milestone.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="hidden lg:block lg:w-1/2" />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
