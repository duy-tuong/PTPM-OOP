"use client";

import { motion } from "motion/react";

// Dấu tick tự vẽ nét (SVG line-draw) cho bảng ma trận /bang-gia - thay CheckCircle (icon Phosphor dựng
// sẵn, không có path để hook pathLength) bằng SVG tự vẽ. whileInView (không phải animate khi mount) để
// tự vẽ lại mỗi lần bảng cuộn vào view, đúng pattern once:false đã dùng ở ScrollReveal.
export function AnimatedCheck({ className }: { className?: string }) {
  return (
    <motion.svg viewBox="0 0 24 24" className={className} fill="none">
      <motion.path
        d="M4 12.5l5 5L20 6.5"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}
