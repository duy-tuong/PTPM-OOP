"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  Server, Database, Shield, Globe, Cloud, Box, Cpu, 
  Network, Lock, HardDrive, Mail 
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = [Server, Database, Shield, Globe, Cloud, Box, Cpu, Network, Lock, HardDrive, Mail];

interface Lane {
  id: number;
  top: string;
  duration: number;
  delay: number;
  iconNode: React.ElementType;
}

export function CloudDataFlowBackground() {
  const prefersReducedMotion = useReducedMotion();
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Tăng số lượng lanes để giống hệt trong ảnh chụp màn hình
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const numLanes = isMobile ? 6 : isTablet ? 10 : 14;

    const newLanes: Lane[] = [];
    for (let i = 0; i < numLanes; i++) {
      const baseTop = (100 / numLanes) * i;
      const noise = Math.random() * 4 - 2;
      const top = Math.max(2, Math.min(98, baseTop + noise));

      newLanes.push({
        id: i,
        top: `${top}%`,
        duration: Math.random() * 10 + 15, // 15-25s
        delay: Math.random() * -20, 
        iconNode: ICONS[Math.floor(Math.random() * ICONS.length)],
      });
    }
    setLanes(newLanes);
  }, []);

  if (!isClient) return <div className="fixed inset-0 -z-20 bg-background" />;

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-background transition-colors duration-700">
      <div className="absolute inset-0 opacity-15 dark:opacity-10">
        {/* 1. Base Gradient Glows (Ambient) */}
        <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[50%] rounded-full bg-indigo-500 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] h-[60%] w-[40%] rounded-full bg-cyan-500 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[60%] rounded-full bg-blue-500 blur-[120px]" />
      </div>

      {/* 2. Grid (Extremely Subtle) */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.07)_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)]"
        style={{ 
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0) 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0) 70%)'
        }}
      />

      {/* 3. Floating Clouds (Abstract) */}
      <FloatingClouds prefersReducedMotion={prefersReducedMotion} />

      {/* 4. Horizontal Data Lanes & Moving Icons */}
      <div className="absolute inset-0">
        {lanes.map(lane => {
          const Icon = lane.iconNode;
          // Alternate between cyan->blue and blue->purple lines
          const isCyanBlue = lane.id % 2 === 0;
          const lineColor = isCyanBlue ? "bg-cyan-500/10 dark:bg-cyan-400/10" : "bg-blue-500/10 dark:bg-blue-400/10";
          const trailColor = isCyanBlue 
            ? "to-cyan-500/60 dark:to-cyan-400/60" 
            : "to-blue-500/60 dark:to-blue-400/60";
          const iconColor = isCyanBlue ? "text-cyan-600 dark:text-cyan-400" : "text-blue-600 dark:text-blue-400";
          const glowColor = isCyanBlue ? "rgba(6,182,212,0.15)" : "rgba(59,130,246,0.15)";
          
          return (
            <div 
              key={lane.id} 
              className={`absolute left-0 right-0 h-[1px] ${lineColor}`}
              style={{ top: lane.top }}
            >
              {!prefersReducedMotion && (
                <motion.div 
                  className="absolute top-1/2 flex -translate-y-1/2 items-center"
                  initial={{ x: "-20vw" }}
                  animate={{ x: "120vw" }}
                  transition={{ 
                    duration: lane.duration, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: lane.delay 
                  }}
                >
                  <div className={`h-[1px] w-24 bg-gradient-to-r from-transparent ${trailColor} sm:w-40`} />
                  
                  <div 
                    className="relative flex size-6 items-center justify-center rounded-[6px] border border-border bg-background shadow-sm sm:size-8"
                    style={{ boxShadow: `0 0 10px ${glowColor}` }}
                  >
                    <Icon className={`size-3 sm:size-4 ${iconColor}`} strokeWidth={1.5} />
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FloatingClouds({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  // Use abstract blurred circles to represent clouds instead of literal cloud shapes
  const clouds = [
    { top: '15%', left: '10%', delay: 0, duration: 8, size: 'w-48 h-24' },
    { top: '65%', left: '5%', delay: 2, duration: 10, size: 'w-64 h-32' },
    { top: '25%', right: '10%', delay: 4, duration: 9, size: 'w-56 h-28' },
    { top: '75%', right: '5%', delay: 1, duration: 7, size: 'w-40 h-20' },
  ];

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {clouds.map((cloud, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-[100%] blur-[60px] opacity-35 dark:opacity-[0.15] bg-white dark:bg-cyan-300 ${cloud.size}`}
          style={{
            top: cloud.top,
            ...(cloud.left ? { left: cloud.left } : {}),
            ...(cloud.right ? { right: cloud.right } : {}),
          }}
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cloud.delay,
          }}
        />
      ))}
    </div>
  );
}
