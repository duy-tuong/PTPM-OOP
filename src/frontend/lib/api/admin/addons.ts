import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AddonQueryParams, AdminAddonDto, CreateAddonDto, UpdateAddonDto } from "@/lib/types/admin";

export function getAdminAddons(baseUrl: string, params: AddonQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminAddonDto>>(baseUrl, "/admin/addons", "GET", { params, token });
}

export function createAdminAddon(baseUrl: string, dto: CreateAddonDto, token?: string) {
  return apiFetch<AdminAddonDto>(baseUrl, "/admin/addons", "POST", { body: dto, token });
}

export function updateAdminAddon(baseUrl: string, id: number, dto: UpdateAddonDto, token?: string) {
  return apiFetch<AdminAddonDto>(baseUrl, `/admin/addons/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminAddon(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/addons/${id}`, "DELETE", { token });
}
