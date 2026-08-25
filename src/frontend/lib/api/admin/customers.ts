import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminCustomerDto, CustomerQueryParams, UpdateCustomerActiveStatusDto, UpdateCustomerDto } from "@/lib/types/admin";

export function getAdminCustomers(baseUrl: string, params: CustomerQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminCustomerDto>>(baseUrl, "/admin/customers", "GET", { params, token });
}

export function getAdminCustomerById(baseUrl: string, id: string, token?: string) {
  return apiFetch<AdminCustomerDto>(baseUrl, `/admin/customers/${id}`, "GET", { token });
}

export function updateAdminCustomerActiveStatus(
  baseUrl: string,
  id: string,
  dto: UpdateCustomerActiveStatusDto,
  token?: string,
) {
  return apiFetch<AdminCustomerDto>(baseUrl, `/admin/customers/${id}/status`, "PUT", { body: dto, token });
}

// CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10).
export function updateAdminCustomer(baseUrl: string, id: string, dto: UpdateCustomerDto, token?: string) {
  return apiFetch<AdminCustomerDto>(baseUrl, `/admin/customers/${id}`, "PUT", { body: dto, token });
}
