import { apiFetch } from "../http";
import type { AdminSearchResultDto } from "@/lib/types/admin";

export function searchAdmin(baseUrl: string, q: string, token?: string) {
  return apiFetch<AdminSearchResultDto>(baseUrl, "/admin/search", "GET", { params: { q }, token });
}
