import { apiFetch } from "./http";
import { getApiUrl, getPublicApiUrl } from "./config";
import type { PagedResult } from "@/lib/types/common";
import type {
  ServiceCategoryDto,
  ServicePlanQueryParams,
  ServicePlanListItemDto,
  ServicePlanDetailDto,
  TldPricingQueryParams,
  TldPricingDto,
  PromotionDto,
  RegionDto,
} from "@/lib/types/catalog";

// Gọi từ Server Component (SSR/SSG, Phase 6.2) - server-to-server, không cần CORS.
// Tags cho phép revalidateTag() trong admin actions xoá đúng cache ngay lập tức.
export function getServiceCategories(next?: { revalidate?: number | false }) {
  return apiFetch<ServiceCategoryDto[]>(getApiUrl(), "/service-categories", "GET", {
    next: { ...next, tags: ["service-categories"] },
  });
}

export function getServiceCategoryBySlug(slug: string, next?: { revalidate?: number | false }) {
  return apiFetch<ServiceCategoryDto>(getApiUrl(), `/service-categories/${slug}`, "GET", {
    next: { ...next, tags: ["service-categories"] },
  });
}

export function getServicePlans(params: ServicePlanQueryParams = {}, next?: { revalidate?: number | false }) {
  return apiFetch<PagedResult<ServicePlanListItemDto>>(getApiUrl(), "/service-plans", "GET", {
    params,
    next: { ...next, tags: ["service-plans"] },
  });
}

// Browser-only (getPublicApiUrl) - dùng trong Client Component (PlanChangeDialog.tsx) fetch trực tiếp
// danh sách gói cùng danh mục để chọn gói đích khi đổi gói - dữ liệu public, không cần token, không
// qua Route Handler proxy như các form đặt hàng (khớp pattern getOrderByCodePublic ở lib/api/sales.ts).
export function getServicePlansPublic(params: ServicePlanQueryParams = {}) {
  return apiFetch<PagedResult<ServicePlanListItemDto>>(getPublicApiUrl(), "/service-plans", "GET", {
    params,
    cache: "no-store",
  });
}

export function getServicePlanBySlug(slug: string, next?: { revalidate?: number | false }) {
  return apiFetch<ServicePlanDetailDto>(getApiUrl(), `/service-plans/${slug}`, "GET", {
    next: { ...next, tags: ["service-plans"] },
  });
}

export function getTldPricing(params: TldPricingQueryParams = {}, next?: { revalidate?: number | false }) {
  return apiFetch<PagedResult<TldPricingDto>>(getApiUrl(), "/tld-pricing", "GET", {
    params,
    next: { ...next, tags: ["tld-pricing"] },
  });
}

export function getPromotions(next?: { revalidate?: number | false }) {
  return apiFetch<PromotionDto[]>(getApiUrl(), "/promotions", "GET", {
    next: { ...next, tags: ["promotions"] },
  });
}

// Danh sách cố định nhỏ (3 Region trang trí) - dùng chung cho cả select ở ServicePlanForm.tsx (Admin)
// và filter/badge storefront, đều gọi thẳng endpoint public (không có CRUD Admin riêng).
export function getRegions(next?: { revalidate?: number | false }) {
  return apiFetch<RegionDto[]>(getApiUrl(), "/regions", "GET", {
    next: { ...next, tags: ["regions"] },
  });
}
