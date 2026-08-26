import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/shared/MagneticButton";

// CTA chốt riêng cho /gioi-thieu - cố tình khác style glow/ripple của FinalCtaSection.tsx (trang chủ)
// để mỗi trang có 1 điểm nhấn riêng: khối viền dày solid (border-primary) thay vì glow mờ lan toả. Vẫn
// giữ đúng CTA wording lock toàn site ("Đặt dịch vụ" -> /lien-he) và cặp token bg-primary/text-primary-
// foreground (tự đảm bảo tương phản ở cả 2 theme, không hardcode cyan/đen). Hiệu ứng "dập xuống" khi
// bấm dùng sẵn active:translate-y-px toàn cục của Button (button.tsx), không cần code riêng.
export function AboutFinalCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border-2 border-primary bg-background p-12 text-center md:p-20">
        <h2 className="font-heading text-2xl font-bold text-balance text-foreground sm:text-3xl lg:text-4xl">
          Sẵn sàng nâng tầm hạ tầng?
        </h2>
        <div className="mt-8">
          <MagneticButton>
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 px-10 text-base font-bold md:h-14 md:text-lg"
              render={<Link href="/lien-he">Đặt dịch vụ</Link>}
            />
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
