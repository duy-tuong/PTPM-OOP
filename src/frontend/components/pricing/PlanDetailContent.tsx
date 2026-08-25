import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCheck } from "@/components/pricing/AnimatedCheck";
import { PlanDetailCustomPricing } from "@/components/pricing/PlanDetailCustomPricing";
import { formatCurrency } from "@/lib/utils";
import type { ServicePlanDetailDto } from "@/lib/types/catalog";

// Danh sách tính năng ĐẦY ĐỦ của 1 gói (khác ServiceCoreFeatures.tsx - component đó chỉ gộp top-4
// tính năng nổi bật của NHIỀU gói cho trang danh mục, không hợp cho 1 gói lẻ). Bảng giá liệt kê toàn bộ
// plan.prices nhưng chỉ 1 CTA duy nhất "Đặt dịch vụ" -> /lien-he?planId= (không tạo CTA riêng theo từng
// chu kỳ - OrderRequestForm.tsx đã có sẵn dropdown chọn chu kỳ, tránh trùng lặp hành vi).
export function PlanDetailContent({ plan }: { plan: ServicePlanDetailDto }) {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[3fr_2fr]">
        {plan.features.length > 0 && (
          <div>
            <h2 className="font-heading mb-6 text-2xl font-bold">Tính Năng</h2>
            <ul className="flex flex-col gap-4">
              {plan.features.map((f) => (
                <li key={f.featureKey} className="flex items-center gap-3 text-sm">
                  <AnimatedCheck className="size-4 shrink-0 text-primary" />
                  {f.featureValueText ? (
                    <span className="text-muted-foreground">
                      {f.featureLabel}: <span className="font-medium text-foreground">{f.featureValueText}</span>
                    </span>
                  ) : (
                    <span className="text-foreground">{f.featureLabel}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="glass-card h-fit rounded-2xl p-8">
          <h2 className="font-heading mb-6 text-2xl font-bold">Bảng Giá</h2>

          {plan.packageType === "Custom" ? (
            <PlanDetailCustomPricing plan={plan} />
          ) : (
            <>
              {plan.prices.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {plan.prices.map((price) => (
                    <li
                      key={price.periodMonths}
                      className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
                    >
                      <span className="text-sm text-muted-foreground">
                        {price.periodMonths} tháng
                        {price.isDefault && (
                          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                            Phổ biến
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(price.promotionalPrice ?? price.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có thông tin giá cho gói này.</p>
              )}

              <Button
                className="mt-8 w-full"
                nativeButton={false}
                render={<Link href={`/lien-he?planId=${plan.id}`}>Đặt dịch vụ</Link>}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
