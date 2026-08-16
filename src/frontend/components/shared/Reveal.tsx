"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Fade + trượt lên khi cuộn tới (thay cho IntersectionObserver + class .reveal-item thủ công của bản
// Stitch tham khảo bằng idiom React/Motion tương đương). Tự tắt khi prefers-reduced-motion.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
