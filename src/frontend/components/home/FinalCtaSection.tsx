import Link from "next/link";
import { Reveal } from "@/components/shared/Reveal";
import { RippleButton } from "@/components/shared/RippleButton";
import { Button } from "@/components/ui/button";
import { MouseGlow } from "@/components/home/effects/MouseGlow";

// Section 8/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Khớp lại đúng bản Stitch: KHÔNG bọc trong
// glass-card (nội dung nằm trực tiếp trên nền, để lộ data mesh cố định phía sau qua NetworkField ở
// page.tsx), glow tập trung phía trên (ellipse_at_top) thay vì tâm section. Giữ mouse-glow + RippleButton
// của bản gốc. Bỏ form "nhập email" giả (không có backend endpoint newsletter) - link "đối tác tiếp
// thị liên kết" trỏ thẳng /doi-tac (route thật đã có ở Phase 6.1), không phải trang không tồn tại.
export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_15%,transparent)_0%,transparent_60%)]"
      />
      <MouseGlow className="relative mx-auto max-w-5xl">
        <Reveal className="relative z-10 flex flex-col items-center gap-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl lg:text-5xl lg:whitespace-nowrap">
            Bạn đã sẵn sàng mở rộng quy mô hạ tầng chưa?
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <RippleButton
              href="/lien-he"
              className="h-12 px-8 text-base md:h-14 md:px-10 md:text-lg shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
            >
              Đặt dịch vụ
            </RippleButton>
            <Button
              variant="outline"
              nativeButton={false}
              className="h-12 border-primary px-8 text-base text-primary hover:bg-primary/10 md:h-14 md:px-10 md:text-lg"
              render={<Link href="/lien-he?intent=tu-van">Tư vấn miễn phí</Link>}
            />
          </div>
          <Link
            href="/doi-tac"
            className="text-xs text-muted-foreground/70 transition-colors hover:text-primary hover:underline"
          >
            Trở thành đối tác tiếp thị liên kết
          </Link>
        </Reveal>
      </MouseGlow>
    </section>
  );
}
