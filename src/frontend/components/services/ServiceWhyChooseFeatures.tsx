import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { aggregateHighlightedFeatures } from "@/lib/utils/planFeatures";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

const MIN_FEATURES_TO_SHOW = 3;
const MAX_FEATURES = 8;

// "Vì sao chọn Cloudverse?" - bản mở rộng của ServiceCoreFeatures.tsx nhưng gom trên TOÀN BỘ plan mọi
// danh mục (không giới hạn 1 category) để làm nội dung narrative cho trang chỉ mục /dich-vu. Backend
// không có field metric kiểu uptime%/performance/security dạng số liệu (đã xác nhận qua rà soát Domain)
// nên KHÔNG bịa số liệu - chỉ dùng feature isHighlighted=true THẬT do Admin tự nhập, kèm tên danh mục
// nguồn để khách biết feature này thuộc dịch vụ nào. Ẩn hẳn nếu Admin chưa đánh dấu đủ feature nổi bật.
export function ServiceWhyChooseFeatures({ plans }: { plans: ServicePlanListItemDto[] }) {
  const features = aggregateHighlightedFeatures(plans, MAX_FEATURES);

  if (features.length < MIN_FEATURES_TO_SHOW) {
    return null;
  }

  const categoryByFeatureKey = new Map<string, string>();
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      if (feature.isHighlighted && !categoryByFeatureKey.has(feature.featureKey)) {
        categoryByFeatureKey.set(feature.featureKey, plan.categoryName);
      }
    });
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-10 flex flex-col gap-3 text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Vì sao chọn Cloudverse?</h2>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          Những tính năng nổi bật nhất trong hệ sinh thái dịch vụ, do đội ngũ Cloudverse trực tiếp cấu hình.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {features.map((feature, index) => (
          <ScrollReveal key={feature.featureKey} delay={index * 0.05}>
            <div className="flex h-full flex-col rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary">
              <Sparkle className="mb-2 size-5 text-primary" weight="fill" />
              <p className="text-sm font-medium text-foreground">{feature.featureLabel}</p>
              <p className="text-xs text-muted-foreground">{feature.featureValueText}</p>
              <p className="mt-auto pt-3 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                {categoryByFeatureKey.get(feature.featureKey)}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
