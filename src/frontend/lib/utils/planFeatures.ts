import type { PlanFeatureDto, ServicePlanListItemDto } from "@/lib/types/catalog";

// Tách từ ServiceCoreFeatures.tsx (trang chi tiết danh mục) để dùng lại ở ServiceWhyChooseFeatures.tsx
// (trang chỉ mục, gom trên TOÀN BỘ plan mọi danh mục thay vì 1 danh mục) - cùng 1 logic dedupe theo
// featureKey, chỉ khác limit và tập plans đầu vào. Không bịa feature - chỉ gom field isHighlighted=true
// mà Admin đã tự đánh dấu qua ServicePlanForm.tsx.
export function aggregateHighlightedFeatures(plans: ServicePlanListItemDto[], limit: number): PlanFeatureDto[] {
  const highlighted = new Map<string, PlanFeatureDto>();
  plans.forEach((plan) => {
    plan.features.forEach((feature) => {
      if (feature.isHighlighted && !highlighted.has(feature.featureKey)) {
        highlighted.set(feature.featureKey, feature);
      }
    });
  });
  return [...highlighted.values()].slice(0, limit);
}
