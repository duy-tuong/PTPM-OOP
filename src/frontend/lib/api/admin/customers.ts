import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminCustomerDto, CustomerQueryParams, UpdateCustomerActiveStatusDto } from "@/lib/types/admin";

export function getAdminCustomers(baseUrl: string, params: CustomerQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminCustomerDto>>(baseUrl, "/admin/customers", "GET", { params, token });
}

export function updateAdminCustomerActiveStatus(
  baseUrl: string,
  id: string,
  dto: UpdateCustomerActiveStatusDto,
  token?: string,
) {
  return apiFetch<AdminCustomerDto>(baseUrl, `/admin/customers/${id}/status`, "PUT", { body: dto, token });
}
