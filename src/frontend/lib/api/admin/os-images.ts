import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminOsImageDto, CreateOsImageDto, OsImageQueryParams, UpdateOsImageDto } from "@/lib/types/admin";

export function getAdminOsImages(baseUrl: string, params: OsImageQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminOsImageDto>>(baseUrl, "/admin/os-images", "GET", { params, token });
}

export function createAdminOsImage(baseUrl: string, dto: CreateOsImageDto, token?: string) {
  return apiFetch<AdminOsImageDto>(baseUrl, "/admin/os-images", "POST", { body: dto, token });
}

export function updateAdminOsImage(baseUrl: string, id: number, dto: UpdateOsImageDto, token?: string) {
  return apiFetch<AdminOsImageDto>(baseUrl, `/admin/os-images/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminOsImage(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/os-images/${id}`, "DELETE", { token });
}
