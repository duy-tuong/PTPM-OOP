import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminPromotionDto, CreatePromotionDto, PromotionQueryParams, UpdatePromotionDto } from "@/lib/types/admin";

export function getAdminPromotions(baseUrl: string, params: PromotionQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminPromotionDto>>(baseUrl, "/admin/promotions", "GET", { params, token });
}

export function createAdminPromotion(baseUrl: string, dto: CreatePromotionDto, token?: string) {
  return apiFetch<AdminPromotionDto>(baseUrl, "/admin/promotions", "POST", { body: dto, token });
}

export function updateAdminPromotion(baseUrl: string, id: number, dto: UpdatePromotionDto, token?: string) {
  return apiFetch<AdminPromotionDto>(baseUrl, `/admin/promotions/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminPromotion(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/promotions/${id}`, "DELETE", { token });
}
