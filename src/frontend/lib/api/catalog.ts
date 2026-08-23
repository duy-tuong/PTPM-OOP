import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { PagedResult } from "@/lib/types/common";
import type {
  ServiceCategoryDto,
  ServicePlanQueryParams,
  ServicePlanListItemDto,
  ServicePlanDetailDto,
  TldPricingQueryParams,
  TldPricingDto,
  PromotionDto,
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
