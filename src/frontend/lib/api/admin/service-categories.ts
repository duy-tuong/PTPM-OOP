import { apiFetch } from "../http";
import type {
  AdminServiceCategoryDto,
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from "@/lib/types/admin";

// baseUrl truyền vào là API_URL (đọc lần đầu ở Server Component) hoặc "/api/backend" (thao tác
// từ Client Component qua Route Handler proxy, Phase 6.5) - xem Design System §"3 cách gọi backend".
export function getAdminServiceCategories(baseUrl: string, token?: string) {
  return apiFetch<AdminServiceCategoryDto[]>(baseUrl, "/admin/service-categories", "GET", { token });
}

export function createAdminServiceCategory(baseUrl: string, dto: CreateServiceCategoryDto, token?: string) {
  return apiFetch<AdminServiceCategoryDto>(baseUrl, "/admin/service-categories", "POST", { body: dto, token });
}

export function updateAdminServiceCategory(baseUrl: string, id: number, dto: UpdateServiceCategoryDto, token?: string) {
  return apiFetch<AdminServiceCategoryDto>(baseUrl, `/admin/service-categories/${id}`, "PUT", { body: dto, token });
}

export function deleteAdminServiceCategory(baseUrl: string, id: number, token?: string) {
  return apiFetch<void>(baseUrl, `/admin/service-categories/${id}`, "DELETE", { token });
}
