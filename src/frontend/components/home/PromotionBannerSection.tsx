import Link from "next/link";
import { Lightning } from "@phosphor-icons/react/dist/ssr";
import { getPromotions } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { CountdownBadge } from "@/components/home/CountdownBadge";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Button } from "@/components/ui/button";

// Section 5/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Chỉ render nếu có khuyến mãi đang hiệu lực
// thật (getPromotions() đã lọc IsActive+trong khoảng ngày ở backend, sắp theo EndDate tăng dần) - bỏ
// hẳn section nếu không có, không bịa khuyến mãi.
//
// Nâng cấp "Floating Glass Card" (thay banner tràn viền cũ): dùng lại .glass-card/.text-gradient-primary/
// .animate-ambient-blob/.btn-shine + màu glow đã có sẵn (mirror đúng shadow CTA của Hero ở Navbar.tsx),
// không hardcode màu mới - giữ đúng "khoá 1 palette" đã áp dụng xuyên suốt site.
export async function PromotionBannerSection() {
  const promotions = await safeFetch(() => getPromotions({ revalidate: 300 }), []);

  if (promotions.length === 0) {
    return null;
  }

  const promotion = promotions[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal>
        <div className="glass-card relative overflow-hidden rounded-3xl border border-primary/40 p-8 md:p-14">
          {/* Blob nền trôi chậm - tái dùng nguyên .animate-ambient-blob đã có (Hero), không viết
              animation liên tục mới. */}
          <div
            aria-hidden
            className="animate-ambient-blob pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="relative flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
            <ScrollReveal direction="left" delay={0.2} className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
              <span className="flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
                <Lightning className="size-4" weight="fill" />
                Ưu Đãi Có Hạn
              </span>
              <h2 className="text-gradient-primary font-heading max-w-[520px] text-3xl font-bold text-balance sm:text-4xl md:text-5xl">
                {promotion.name}
              </h2>
              {promotion.description && <p className="max-w-[500px] text-muted-foreground">{promotion.description}</p>}
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2} className="flex flex-col items-center gap-6">
              <CountdownBadge targetIso={promotion.endDate} />
              <MagneticButton>
                <Button
                  size="lg"
                  nativeButton={false}
                  className="btn-shine px-10 shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_40%,transparent)]"
                  render={<Link href={`/lien-he?promotionCode=${promotion.code}`}>Đặt dịch vụ</Link>}
                />
              </MagneticButton>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
