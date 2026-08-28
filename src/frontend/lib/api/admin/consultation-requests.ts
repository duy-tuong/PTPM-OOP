import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminConsultationRequestDto, ConsultationRequestQueryParams, UpdateConsultationRequestStatusDto } from "@/lib/types/admin";

export function getAdminConsultationRequests(baseUrl: string, params: ConsultationRequestQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminConsultationRequestDto>>(baseUrl, "/admin/consultation-requests", "GET", { params, token });
}

export function updateAdminConsultationRequestStatus(
  baseUrl: string,
  id: number,
  dto: UpdateConsultationRequestStatusDto,
  token?: string,
) {
  return apiFetch<AdminConsultationRequestDto>(baseUrl, `/admin/consultation-requests/${id}/status`, "PUT", { body: dto, token });
}
