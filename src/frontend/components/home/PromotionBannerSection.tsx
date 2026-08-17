import Link from "next/link";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { getPromotions } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { CountdownBadge } from "@/components/home/CountdownBadge";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { Button } from "@/components/ui/button";

// Section 5/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Thay countdown tĩnh giả "02:14:45:30" của
// bản Stitch gốc bằng CountdownBadge đếm thật tới endDate. Chỉ render nếu có khuyến mãi đang hiệu lực
// thật (getPromotions() đã lọc IsActive+trong khoảng ngày ở backend, sắp theo EndDate tăng dần) - bỏ
// hẳn section nếu không có, không bịa khuyến mãi.
export async function PromotionBannerSection() {
  const promotions = await safeFetch(() => getPromotions({ revalidate: 300 }), []);

  if (promotions.length === 0) {
    return null;
  }

  const promotion = promotions[0];

  return (
    <section className="relative w-full overflow-hidden border-y border-primary/20 py-16">
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgrwtEgzOR3Jcj2DYPuCd0ZbbF9_th2kNNEDDDwHH0k7XqE5iVM82Oy7ExzQ8eBe5rqWSwIuqVexR8RwnA5QbaWjK-S-1RxsRbqFmxNUxGnIG9qlhJ2bqaK2ydaPG-KHQFfixEDTViWJY_VySuT74l7YG4Wf-uFcC4Hvk1ccOi-Uz38t0sHPJwCvTuRh_7ntAw7bHZR6y6MBTlj_UY63LuZIrWmPB5OrLfjFYMzG53oV42Yu5vbw0nbg"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:px-8">
        <div className="flex flex-col gap-4 text-center lg:text-left">
          <span className="text-xs font-medium tracking-widest text-primary uppercase">Ưu Đãi Có Hạn</span>
          <h2 className="font-heading max-w-[500px] text-2xl font-bold sm:text-3xl">{promotion.name}</h2>
          {promotion.description && <p className="max-w-[500px] text-muted-foreground">{promotion.description}</p>}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 font-mono text-primary">
            <Clock className="size-5" />
            <CountdownBadge targetIso={promotion.endDate} />
          </div>
          <MagneticButton>
            <Button
              size="lg"
              nativeButton={false}
              className="px-10 shadow-[0_0_30px_color-mix(in_oklch,var(--primary)_30%,transparent)]"
              render={<Link href={`/lien-he?promotionCode=${promotion.code}`}>Đặt dịch vụ</Link>}
            />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
