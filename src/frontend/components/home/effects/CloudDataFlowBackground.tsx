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
      
      {/* 1. Base Gradient Glows */}
      <div className="absolute -top-[20%] -left-[10%] h-[70%] w-[50%] rounded-full bg-purple-500/20 blur-[120px] dark:bg-purple-600/20" />
      <div className="absolute top-[40%] -right-[10%] h-[60%] w-[40%] rounded-full bg-blue-500/15 blur-[120px] dark:bg-blue-600/15" />
      <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[60%] rounded-full bg-indigo-500/15 blur-[120px] dark:bg-indigo-600/15" />

      {/* 2. Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)]"
        style={{ 
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 10%, rgba(0,0,0,1) 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 10%, rgba(0,0,0,1) 70%)'
        }}
      />

      {/* 3. Floating Clouds */}
      <FloatingClouds prefersReducedMotion={prefersReducedMotion} />

      {/* 4. Horizontal Data Lanes & Moving Icons */}
      <div className="absolute inset-0">
        {lanes.map(lane => {
          const Icon = lane.iconNode;
          return (
            <div 
              key={lane.id} 
              // Đường kẻ ngang mờ nhẹ
              className="absolute left-0 right-0 h-[1px] bg-indigo-500/15 dark:bg-indigo-400/20"
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
                  {/* Trail sáng */}
                  <div className="h-[2px] w-24 bg-gradient-to-r from-transparent to-purple-500/80 dark:to-purple-400/80 sm:w-40" />
                  
                  {/* Khối chứa Icon */}
                  <div className="relative flex size-8 items-center justify-center rounded-[8px] border border-purple-500/40 bg-white/80 shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-md dark:border-purple-400/50 dark:bg-background/80 dark:shadow-[0_0_15px_rgba(168,85,247,0.4)] sm:size-10 sm:rounded-[10px]">
                    <Icon className="size-4 text-purple-600 dark:text-purple-400 sm:size-5" strokeWidth={1.5} />
                    <div className="absolute inset-0 rounded-[8px] bg-purple-500/5 sm:rounded-[10px]" />
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
  const clouds = [
    { top: '15%', left: '-2%', delay: 0, duration: 18, scale: 1.1 },
    { top: '65%', left: '4%', delay: 2, duration: 22, scale: 0.8 },
    { top: '25%', right: '2%', delay: 4, duration: 20, scale: 1 },
    { top: '75%', right: '-4%', delay: 1, duration: 15, scale: 1.2 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {clouds.map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: cloud.top,
            ...(cloud.left ? { left: cloud.left } : {}),
            ...(cloud.right ? { right: cloud.right } : {}),
            transform: `scale(${cloud.scale})`,
          }}
          animate={prefersReducedMotion ? {} : {
            y: [0, -15, 0],
            x: [0, 8, 0],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cloud.delay,
          }}
        >
          {/* Cấu trúc Cloud */}
          <div className="relative h-32 w-48 opacity-90 drop-shadow-2xl dark:opacity-60">
            {/* Bóng đổ / Glow phía sau mây */}
            <div className="absolute inset-0 scale-75 rounded-full bg-indigo-200/40 blur-2xl dark:bg-indigo-900/40" />
            
            {/* Các cục bông của đám mây */}
            <div className="absolute bottom-4 left-4 h-16 w-16 rounded-full bg-white shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.04)] dark:bg-slate-800 dark:shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.2)]" />
            <div className="absolute bottom-4 right-6 h-20 w-20 rounded-full bg-white shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.04)] dark:bg-slate-800 dark:shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.2)]" />
            <div className="absolute top-4 left-10 h-24 w-24 rounded-full bg-white shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.04)] dark:bg-slate-800 dark:shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.2)]" />
            <div className="absolute bottom-4 left-8 h-12 w-28 rounded-full bg-white dark:bg-slate-800" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
