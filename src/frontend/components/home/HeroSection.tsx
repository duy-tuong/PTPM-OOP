"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Track scroll position of this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Map scroll progress (0 to 1) to opacity and scale
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section ref={sectionRef} className="relative flex min-h-screen flex-col items-center pt-32 pb-16 overflow-hidden px-4 sm:px-6 lg:px-8">
      
      <motion.div 
        style={{ opacity, scale, y }}
        className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center gap-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
          </span>
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">Đang hoạt động ổn định 99.9% uptime</span>
        </div>

        <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[68px]">
          Hạ tầng Cloud vững chắc
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">cho doanh nghiệp Việt</span>
        </h1>
        
        <p className="mx-auto max-w-[50ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
          Một nền tảng cho VPS, Hosting, Domain, Email doanh nghiệp, SSL và Firewall chống DDoS. Triển khai chỉ trong vài phút.
        </p>
        
        <div className="mt-2 flex flex-col gap-4 sm:flex-row">
          <MagneticButton>
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 gap-2 px-8 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all border-0 md:h-14 md:px-10"
              render={
                <Link href="/dich-vu">
                  Khám phá dịch vụ
                  <ArrowRight className="size-5" weight="bold" />
                </Link>
              }
            />
          </MagneticButton>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-12 gap-2 px-8 text-base font-semibold bg-transparent text-foreground border border-border hover:bg-muted transition-all md:h-14 md:px-10"
            render={
              <Link href="/lien-he?intent=tu-van">
                <EnvelopeSimple className="size-5" weight="bold" />
                Liên hệ kinh doanh
              </Link>
            }
          />
        </div>

        {/* Visual Focal Point: Minimalist Server Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mt-16 w-full rounded-2xl border border-border/50 bg-background/40 p-2 shadow-sm backdrop-blur-sm sm:p-3"
        >
          <div className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm text-left">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 hidden sm:flex">
                  <div className="size-3 rounded-full bg-border" />
                  <div className="size-3 rounded-full bg-border" />
                  <div className="size-3 rounded-full bg-border" />
                </div>
                <div className="h-4 w-px bg-border/50 hidden sm:block" />
                <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-500" />
                  node-hcm-01.cloudverse.vn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-emerald-500">All systems operational</span>
              </div>
            </div>
            
            {/* Body */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6">
              {/* Metric 1 */}
              <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">CPU Usage</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">12%</span>
                  <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">-2.4%</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "12%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-blue-500" 
                  />
                </div>
              </div>
              
              {/* Metric 2 */}
              <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Memory Allocation</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">4.2<span className="text-lg font-semibold text-muted-foreground">GB</span></span>
                  <span className="text-xs font-medium text-muted-foreground">/ 16 GB</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "26%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full rounded-full bg-cyan-500" 
                  />
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Network Traffic</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">854<span className="text-lg font-semibold text-muted-foreground">Mbps</span></span>
                </div>
                {/* Mini chart mock */}
                <div className="mt-3 flex h-4 w-full items-end gap-1">
                  {[40, 25, 60, 30, 80, 45, 90, 50, 65, 85].map((val, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 0.5, delay: 0.8 + (i * 0.05) }}
                      className="w-full bg-blue-500/20 rounded-t-[2px] overflow-hidden relative"
                    >
                      <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-[2px]" style={{ height: `${val * 0.4}%` }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
