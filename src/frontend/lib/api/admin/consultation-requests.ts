import { apiFetch } from "../http";
import type { AdminConsultationRequestDto, UpdateConsultationRequestStatusDto } from "@/lib/types/admin";

// Không phân trang - controller trả List<T> phẳng (khác OrderRequests dùng PagedResult<T>).
export function getAdminConsultationRequests(baseUrl: string, token?: string) {
  return apiFetch<AdminConsultationRequestDto[]>(baseUrl, "/admin/consultation-requests", "GET", { token });
}

export function updateAdminConsultationRequestStatus(
  baseUrl: string,
  id: number,
  dto: UpdateConsultationRequestStatusDto,
  token?: string,
) {
  return apiFetch<AdminConsultationRequestDto>(baseUrl, `/admin/consultation-requests/${id}/status`, "PUT", { body: dto, token });
}
