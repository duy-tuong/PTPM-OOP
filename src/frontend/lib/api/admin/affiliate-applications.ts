import { apiFetch } from "../http";
import type { AdminAffiliateApplicationDto, UpdateAffiliateApplicationStatusDto } from "@/lib/types/admin";

// Không phân trang - controller trả List<T> phẳng (khác OrderRequests dùng PagedResult<T>).
export function getAdminAffiliateApplications(baseUrl: string, token?: string) {
  return apiFetch<AdminAffiliateApplicationDto[]>(baseUrl, "/admin/affiliate-applications", "GET", { token });
}

export function updateAdminAffiliateApplicationStatus(
  baseUrl: string,
  id: number,
  dto: UpdateAffiliateApplicationStatusDto,
  token?: string,
) {
  return apiFetch<AdminAffiliateApplicationDto>(baseUrl, `/admin/affiliate-applications/${id}/status`, "PUT", { body: dto, token });
}
