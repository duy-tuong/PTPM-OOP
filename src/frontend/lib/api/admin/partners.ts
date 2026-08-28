import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminPartnerDto, CreatePartnerDto, PartnerQueryParams, UpdatePartnerDto } from "@/lib/types/admin";

export function getAdminPartners(baseUrl: string, params: PartnerQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminPartnerDto>>(baseUrl, "/admin/partners", "GET", { params, token });
}

export function createAdminPartner(baseUrl: string, dto: CreatePartnerDto, token?: string) {
  return apiFetch<AdminPartnerDto>(baseUrl, "/admin/partners", "POST", { body: dto, token });
}

export function updateAdminPartner(baseUrl: string, id: number, dto: UpdatePartnerDto, token?: string) {
  return apiFetch<AdminPartnerDto>(baseUrl, `/admin/partners/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminPartner(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/partners/${id}`, "DELETE", { token });
}
