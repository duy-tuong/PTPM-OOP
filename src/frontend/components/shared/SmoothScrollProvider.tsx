"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Bọc route group (public) bằng Lenis (cuộn có đà/momentum kiểu landing page cao cấp) - KHÔNG áp cho
// Admin panel (app/admin/layout.tsx không đụng tới), vì dashboard/bảng dữ liệu cần cuộn nhanh tự nhiên
// để scan, momentum scroll gây khó chịu ở use-case đó.
// Tự tắt hẳn khi prefers-reduced-motion (Lenis không tự làm việc này) - mirror đúng pattern guard đã
// dùng nhất quán ở Reveal/ScrollReveal/MagneticButton/SpotlightCard, không có ngoại lệ nào bỏ qua.
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return <ReactLenis root>{children}</ReactLenis>;
}
