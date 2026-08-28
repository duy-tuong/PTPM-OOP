"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

const CENTER = { x: 200, y: 200, r: 11 };
const NODES = [
  { x: 200, y: 76, r: 6 },
  { x: 322, y: 138, r: 5 },
  { x: 344, y: 262, r: 6 },
  { x: 238, y: 340, r: 5 },
  { x: 108, y: 322, r: 6 },
  { x: 58, y: 218, r: 5 },
  { x: 92, y: 108, r: 6 },
];

const lineVariants: Variants = {
  hidden: { opacity: 0 },
  show: (i: number) => ({ opacity: 1, transition: { delay: 0.3 + i * 0.08, duration: 0.5 } }),
};

const nodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.5 + i * 0.08, duration: 0.4, ease: "backOut" },
  }),
};

// Visual biểu tượng cho Hero - 1 node trung tâm (Cloudverse) nối tới các node xung quanh (hạ tầng/kết
// nối), thuần trang trí (KHÔNG phải sơ đồ hạ tầng thật). Trình tự xuất hiện khi trang load: đường nối
// fade in trước, node fade+scale in sau (so le) - đúng brief "network nodes fade in, connection lines
// xuất hiện". Tự trôi nhẹ bằng class .float sẵn có (globals.css, đã tự tắt khi prefers-reduced-motion).
export function AboutHeroVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="float mx-auto aspect-square w-full max-w-md">
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
        {NODES.map((node, index) => (
          <motion.line
            key={`line-${node.x}-${node.y}`}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={node.x}
            y2={node.y}
            stroke="var(--primary)"
            strokeOpacity={0.35}
            strokeWidth={1.5}
            variants={shouldReduceMotion ? undefined : lineVariants}
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            custom={index}
          />
        ))}

        {NODES.map((node, index) => (
          <motion.circle
            key={`node-${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="var(--primary)"
            fillOpacity={0.7}
            variants={shouldReduceMotion ? undefined : nodeVariants}
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            custom={index}
          />
        ))}

        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={CENTER.r}
          fill="var(--primary)"
          initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.5 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
        />
        <circle cx={CENTER.x} cy={CENTER.y} r={CENTER.r + 10} fill="var(--primary)" fillOpacity={0.12} />
      </svg>
    </div>
  );
}
