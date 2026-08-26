import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { aggregateHighlightedFeatures } from "@/lib/utils/planFeatures";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

// Section 2/4 - "Thông số cốt lõi" trước khi khách nhìn vào giá. Không có field liệt kê tính năng cấp
// danh mục trong DB (ServiceCategoryDto chỉ có description dạng text tự do) nên KHÔNG bịa nội dung
// marketing cứng - gom feature có isHighlighted=true thật (Admin tự đánh dấu qua ServicePlanForm.tsx)
// từ tất cả gói thuộc danh mục, khử trùng theo featureKey, lấy tối đa 4 (xem lib/utils/planFeatures.ts,
// dùng chung với ServiceWhyChooseFeatures.tsx ở trang chỉ mục). Dùng 1 icon chung nhất quán cho mọi ô -
// featureKey do Admin tự nhập tự do, không có danh sách cố định để map icon riêng chính xác cho từng
// feature.
export function ServiceCoreFeatures({ plans }: { plans: ServicePlanListItemDto[] }) {
  const features = aggregateHighlightedFeatures(plans, 4);

  if (features.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.featureKey}
            className="rounded-lg border border-border bg-card/50 p-4 transition-colors hover:border-primary"
          >
            <Sparkle className="mb-2 size-5 text-primary" weight="fill" />
            <p className="text-sm font-medium text-foreground">{feature.featureLabel}</p>
            <p className="text-xs text-muted-foreground">{feature.featureValueText}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
