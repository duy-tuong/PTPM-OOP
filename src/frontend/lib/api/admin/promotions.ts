import { apiFetch } from "../http";
import type { AdminPromotionDto, CreatePromotionDto, UpdatePromotionDto } from "@/lib/types/admin";

export function getAdminPromotions(baseUrl: string, token?: string) {
  return apiFetch<AdminPromotionDto[]>(baseUrl, "/admin/promotions", "GET", { token });
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
