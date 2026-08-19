"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealDirection = "up" | "left" | "right";

// Biến thể "wow" của Reveal.tsx - dùng cho các section cần hiệu ứng cuộn 2 chiều (chạy lại mỗi lần
// cuộn qua, không chỉ 1 lần như Reveal). Đang dùng ở "Danh mục dịch vụ" (ServicesBentoSection),
// "Gói dịch vụ nổi bật" (PlanPricingGrid) và "Khuyến mãi" (PromotionBannerSection) - không đổi
// Reveal.tsx dùng chung toàn site để tránh ảnh hưởng các section khác chưa cần hiệu ứng này.
// Khác Reveal ở 2 điểm:
// 1. viewport once:false - hiệu ứng chạy lại mỗi lần cuộn qua (cả cuộn lên lẫn cuộn xuống).
// 2. direction="up" (mặc định, giữ nguyên hành vi cũ - fade+scale 0.96->1+trượt lên, dùng transform+
//    opacity, rẻ/GPU-accelerated) hoặc "left"/"right" (trượt ngang thuần x:-50/+50->0, không scale -
//    dùng cho hiệu ứng "2 luồng hội tụ" ở banner Khuyến mãi).
export function ScrollReveal({
  children,
  delay = 0,
  className,
  direction = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: RevealDirection;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = direction === "up" ? { opacity: 0, y: 24, scale: 0.96 } : { opacity: 0, x: direction === "left" ? -50 : 50 };
  const animate = direction === "up" ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, x: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: false, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
