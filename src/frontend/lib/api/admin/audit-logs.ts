import { apiFetch } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminAuditLogDto, AuditLogQueryParams } from "@/lib/types/admin";

export function getAdminAuditLogs(baseUrl: string, params: AuditLogQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminAuditLogDto>>(baseUrl, "/admin/audit-logs", "GET", { params, token });
}
