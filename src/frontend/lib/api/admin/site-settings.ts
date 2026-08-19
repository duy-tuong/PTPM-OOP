import { apiFetch } from "../http";
import type { AdminSiteSettingDto, CreateSiteSettingDto, UpdateSiteSettingDto } from "@/lib/types/admin";

export function getAdminSiteSettings(baseUrl: string, token?: string) {
  return apiFetch<AdminSiteSettingDto[]>(baseUrl, "/admin/site-settings", "GET", { token });
}

export function createAdminSiteSetting(baseUrl: string, dto: CreateSiteSettingDto, token?: string) {
  return apiFetch<AdminSiteSettingDto>(baseUrl, "/admin/site-settings", "POST", { body: dto, token });
}

export function updateAdminSiteSetting(baseUrl: string, id: number, dto: UpdateSiteSettingDto, token?: string) {
  return apiFetch<AdminSiteSettingDto>(baseUrl, `/admin/site-settings/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminSiteSetting(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/site-settings/${id}`, "DELETE", { token });
}
