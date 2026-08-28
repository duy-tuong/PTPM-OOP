import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminContentPageDto, ContentPageQueryParams, CreateContentPageDto, UpdateContentPageDto } from "@/lib/types/admin";

export function getAdminContentPages(baseUrl: string, params: ContentPageQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminContentPageDto>>(baseUrl, "/admin/content-pages", "GET", { params, token });
}

export function createAdminContentPage(baseUrl: string, dto: CreateContentPageDto, token?: string) {
  return apiFetch<AdminContentPageDto>(baseUrl, "/admin/content-pages", "POST", { body: dto, token });
}

export function updateAdminContentPage(baseUrl: string, id: number, dto: UpdateContentPageDto, token?: string) {
  return apiFetch<AdminContentPageDto>(baseUrl, `/admin/content-pages/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminContentPage(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/content-pages/${id}`, "DELETE", { token });
}
