import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type {
  AdminServicePlanDto,
  AdminServicePlanQueryParams,
  CreateServicePlanDto,
  UpdateServicePlanDto,
} from "@/lib/types/admin";

export function getAdminServicePlans(baseUrl: string, params: AdminServicePlanQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminServicePlanDto>>(baseUrl, "/admin/service-plans", "GET", { params, token });
}

export function getAdminServicePlanById(baseUrl: string, id: number, token?: string) {
  return apiFetch<AdminServicePlanDto>(baseUrl, `/admin/service-plans/${id}`, "GET", { token });
}

export function createAdminServicePlan(baseUrl: string, dto: CreateServicePlanDto, token?: string) {
  return apiFetch<AdminServicePlanDto>(baseUrl, "/admin/service-plans", "POST", { body: dto, token });
}

export function updateAdminServicePlan(baseUrl: string, id: number, dto: UpdateServicePlanDto, token?: string) {
  return apiFetch<AdminServicePlanDto>(baseUrl, `/admin/service-plans/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminServicePlan(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/service-plans/${id}`, "DELETE", { token });
}
