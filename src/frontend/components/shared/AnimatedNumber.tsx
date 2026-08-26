"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useInView } from "motion/react";

export function AnimatedNumber({ 
  value, 
  className, 
  decimals = 0 
}: { 
  value: number; 
  className?: string;
  decimals?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const spring = useSpring(0, { stiffness: 40, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
