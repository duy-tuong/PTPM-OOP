"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "motion/react";
import { formatCurrency } from "@/lib/utils";

export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => formatCurrency(Math.round(v)));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
