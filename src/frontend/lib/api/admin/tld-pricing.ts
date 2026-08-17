import { apiFetch } from "../http";
import type { AdminTldPricingDto, CreateTldPricingDto, UpdateTldPricingDto } from "@/lib/types/admin";

export function getAdminTldPricing(baseUrl: string, token?: string) {
  return apiFetch<AdminTldPricingDto[]>(baseUrl, "/admin/tld-pricing", "GET", { token });
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
