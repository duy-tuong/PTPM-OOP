import { apiFetch } from "../http";
import type { DashboardStatsDto } from "@/lib/types/admin";

export function getAdminDashboardStats(baseUrl: string, token?: string) {
  return apiFetch<DashboardStatsDto>(baseUrl, "/admin/dashboard-stats", "GET", { token });
}
