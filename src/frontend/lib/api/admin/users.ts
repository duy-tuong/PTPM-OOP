import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminUserDto, CreateUserDto, UpdateUserDto, ResetUserPasswordDto, UserQueryParams } from "@/lib/types/admin";

export function getAdminUsers(baseUrl: string, params: UserQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminUserDto>>(baseUrl, "/admin/users", "GET", { params, token });
}

export function createAdminUser(baseUrl: string, dto: CreateUserDto, token?: string) {
  return apiFetch<AdminUserDto>(baseUrl, "/admin/users", "POST", { body: dto, token });
}

export function updateAdminUser(baseUrl: string, id: string, dto: UpdateUserDto, token?: string) {
  return apiFetch<AdminUserDto>(baseUrl, `/admin/users/${id}`, "PUT", { body: dto, token });
}

export function resetAdminUserPassword(baseUrl: string, id: string, dto: ResetUserPasswordDto, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/users/${id}/password`, "PUT", { body: dto, token });
}

export function deleteAdminUser(baseUrl: string, id: string, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/users/${id}`, "DELETE", { token });
}
