import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminTldPricingDto, CreateTldPricingDto, TldPricingQueryParams, UpdateTldPricingDto } from "@/lib/types/admin";

export function getAdminTldPricing(baseUrl: string, params: TldPricingQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminTldPricingDto>>(baseUrl, "/admin/tld-pricing", "GET", { params, token });
}

export function createAdminTldPricing(baseUrl: string, dto: CreateTldPricingDto, token?: string) {
  return apiFetch<AdminTldPricingDto>(baseUrl, "/admin/tld-pricing", "POST", { body: dto, token });
}

export function updateAdminTldPricing(baseUrl: string, id: number, dto: UpdateTldPricingDto, token?: string) {
  return apiFetch<AdminTldPricingDto>(baseUrl, `/admin/tld-pricing/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminTldPricing(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/tld-pricing/${id}`, "DELETE", { token });
}
