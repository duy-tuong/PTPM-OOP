import Link from "next/link";
import { ArrowRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { ParallaxLayer } from "@/components/shared/ParallaxLayer";
import { TopographicLines } from "@/components/home/effects/TopographicLines";

// Section 1/9 của Trang chủ (pivot 2 - theme "Cloudverse", xem plan Phase 6.2). Bố cục center/stack
// (khác bản split 2 cột của pivot 1): 2 blob nền cyan/tím trôi chậm + line-art "Topographic Contour
// Lines" (SVG currentColor, tự đổi Đen/Trắng theo theme, không gradient) qua ParallaxLayer, thay cho
// ảnh orb hotlink cũ. `NetworkField` (data mesh) không đặt ở đây nữa - đã chuyển lên mount 1
// lần ở app/(public)/page.tsx làm nền cố định (fixed) xuyên suốt trang thay cho ShaderBackground (hiệu
// ứng cực quang WebGL đã bỏ theo yêu cầu). Dòng trust badge dưới CTA cố tình không kèm con số (kiểu
// "10.000 lập trình viên" của bản Stitch gốc là số liệu bịa, không có API/DB nào xác thực) - chỉ dùng
// câu định tính, marquee đối tác thật (Section 2) đảm nhiệm phần bằng chứng cụ thể.
export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 text-center sm:px-6 lg:px-8">
      <ParallaxLayer depth={0.8} className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-ambient-blob absolute top-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full bg-primary opacity-40 blur-[100px]" />
        <div className="animate-ambient-blob absolute top-[40%] right-[-150px] h-[500px] w-[500px] rounded-full bg-[var(--accent-purple)] opacity-20 blur-[100px]" />
      </ParallaxLayer>

      <ParallaxLayer depth={0.4} className="pointer-events-none absolute inset-0 -z-10">
        <TopographicLines />
      </ParallaxLayer>

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <div className="glass-card inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">Đang hoạt động ổn định 99.9% uptime</span>
        </div>

        <h1 className="font-heading text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl lg:text-[64px]">
          Hạ tầng Cloud vững chắc
          <br />
          <span className="text-gradient-primary">cho doanh nghiệp Việt</span>
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
              className="btn-shine h-12 gap-2 px-8 text-base font-semibold shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_45%,transparent)] transition-transform hover:scale-105 md:h-14 md:px-10 md:text-lg"
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
            variant="ghost"
            nativeButton={false}
            className="btn-shine glass-card h-12 gap-2 px-8 text-base font-semibold text-foreground transition-transform hover:scale-105 hover:bg-white/10 md:h-14 md:px-10 md:text-lg"
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
      </div>
    </section>
  );
}
