"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { formatCurrency } from "@/lib/utils";

// Đếm số chạy (kiểu đồng hồ công tơ mét) khi giá đổi - dùng useSpring/useTransform của motion (đã là
// dependency sẵn có, không cần thư viện mới). motion.span nhận thẳng MotionValue<string> làm children -
// Framer Motion tự cập nhật text DOM trực tiếp, không cần re-render React mỗi frame.
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => formatCurrency(Math.round(v)));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}
