import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminFaqDto, CreateFaqDto, FaqQueryParams, UpdateFaqDto } from "@/lib/types/admin";

export function getAdminFaqs(baseUrl: string, params: FaqQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminFaqDto>>(baseUrl, "/admin/faqs", "GET", { params, token });
}

export function createAdminFaq(baseUrl: string, dto: CreateFaqDto, token?: string) {
  return apiFetch<AdminFaqDto>(baseUrl, "/admin/faqs", "POST", { body: dto, token });
}

export function updateAdminFaq(baseUrl: string, id: number, dto: UpdateFaqDto, token?: string) {
  return apiFetch<AdminFaqDto>(baseUrl, `/admin/faqs/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminFaq(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/faqs/${id}`, "DELETE", { token });
}
