import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminNewsCategoryDto, CreateNewsCategoryDto, NewsCategoryQueryParams, UpdateNewsCategoryDto } from "@/lib/types/admin";

export function getAdminNewsCategories(baseUrl: string, params: NewsCategoryQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminNewsCategoryDto>>(baseUrl, "/admin/news-categories", "GET", { params, token });
}

export function createAdminNewsCategory(baseUrl: string, dto: CreateNewsCategoryDto, token?: string) {
  return apiFetch<AdminNewsCategoryDto>(baseUrl, "/admin/news-categories", "POST", { body: dto, token });
}

export function updateAdminNewsCategory(baseUrl: string, id: number, dto: UpdateNewsCategoryDto, token?: string) {
  return apiFetch<AdminNewsCategoryDto>(baseUrl, `/admin/news-categories/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminNewsCategory(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/news-categories/${id}`, "DELETE", { token });
}
