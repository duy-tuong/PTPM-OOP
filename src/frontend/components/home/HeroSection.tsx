"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { ParallaxLayer } from "@/components/shared/ParallaxLayer";

// Section 1/9 của Trang chủ (pivot 2 - theme "Cloudverse", xem plan Phase 6.2). Bố cục center/stack
// (khác bản split 2 cột của pivot 1): 2 blob nền cyan/tím trôi chậm + line-art "Topographic Contour
// Lines" (SVG currentColor, tự đổi Đen/Trắng theo theme, không gradient) qua ParallaxLayer, thay cho
// ảnh orb hotlink cũ. `NetworkField` (data mesh) không đặt ở đây nữa - đã chuyển lên mount 1
// lần ở app/(public)/page.tsx làm nền cố định (fixed) xuyên suốt trang thay cho ShaderBackground (hiệu
// ứng cực quang WebGL đã bỏ theo yêu cầu). Dòng trust badge dưới CTA cố tình không kèm con số (kiểu
// "10.000 lập trình viên" của bản Stitch gốc là số liệu bịa, không có API/DB nào xác thực) - chỉ dùng
// câu định tính, marquee đối tác thật (Section 2) đảm nhiệm phần bằng chứng cụ thể.
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Track scroll position of this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"], // start animating when top of section hits top of viewport, end when bottom hits top
  });

  // Map scroll progress (0 to 1) to opacity and scale
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-12 text-center sm:px-6 lg:px-8">
      {/* Background ambient blobs have been moved to CloudDataFlowBackground for better coordination */}
      
      <motion.div 
        style={{ opacity, scale, y }}
        className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
      >
        <div className="glass-card inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-blue-500" />
          </span>
          <span className="text-sm font-medium text-foreground">Đang hoạt động ổn định 99.9% uptime</span>
        </div>

        <h1 className="font-heading text-4xl leading-[1.1] font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[64px]">
          Hạ tầng Cloud vững chắc
          <br />
          <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">cho doanh nghiệp Việt</span>
        </h1>
        <p className="max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
          Một nền tảng cho VPS, Hosting, Domain, Email doanh nghiệp, SSL và Firewall chống DDoS. Triển
          khai chỉ trong vài phút.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <MagneticButton>
            <Button
              size="lg"
              nativeButton={false}
              className="btn-shine h-12 gap-2 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_24px_rgba(99,102,241,0.3)] transition-transform hover:scale-105 md:h-14 md:px-10 md:text-lg"
              render={
                <Link href="/dich-vu">
                  Khám Phá Dịch Vụ
                  <ArrowRight className="size-5" weight="bold" />
                </Link>
              }
            />
          </MagneticButton>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-12 gap-2 px-8 text-base font-semibold bg-background text-foreground border-border hover:bg-muted transition-transform hover:scale-105 md:h-14 md:px-10 md:text-lg"
            render={
              <Link href="/lien-he?intent=tu-van">
                <EnvelopeSimple className="size-5" weight="bold" />
                Liên Hệ Kinh Doanh
              </Link>
            }
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Được tin dùng bởi các doanh nghiệp trên khắp Việt Nam
        </p>
      </motion.div>
    </section>
  );
}
