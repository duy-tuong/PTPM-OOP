import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminAffiliateApplicationDto, AffiliateApplicationQueryParams, UpdateAffiliateApplicationStatusDto } from "@/lib/types/admin";

export function getAdminAffiliateApplications(baseUrl: string, params: AffiliateApplicationQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminAffiliateApplicationDto>>(baseUrl, "/admin/affiliate-applications", "GET", { params, token });
}

export function updateAdminAffiliateApplicationStatus(
  baseUrl: string,
  id: number,
  dto: UpdateAffiliateApplicationStatusDto,
  token?: string,
) {
  return apiFetch<AdminAffiliateApplicationDto>(baseUrl, `/admin/affiliate-applications/${id}/status`, "PUT", { body: dto, token });
}
