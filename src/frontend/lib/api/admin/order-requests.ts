import { apiFetch, ApiError } from "../http";
import type { PagedResult } from "@/lib/types/common";
import type { AdminOrderRequestDto, OrderRequestQueryParams, UpdateOrderRequestStatusDto } from "@/lib/types/admin";
import type { OrderRequestStatus } from "@/lib/types/enums";

export function getAdminOrderRequests(baseUrl: string, params: OrderRequestQueryParams = {}, token?: string) {
  return apiFetch<PagedResult<AdminOrderRequestDto>>(baseUrl, "/admin/order-requests", "GET", { params, token });
}

export function updateAdminOrderRequestStatus(baseUrl: string, id: number, dto: UpdateOrderRequestStatusDto, token?: string) {
  return apiFetch<AdminOrderRequestDto>(baseUrl, `/admin/order-requests/${id}/status`, "PUT", { body: dto, token });
}

// Dunning Automation (Đợt 2, Phần 8) - itemId là OrderRequestItem.Id (không phải id đơn hàng).
export function liftAdminOrderRequestItemSuspension(baseUrl: string, itemId: number, token?: string) {
  return apiFetch<AdminOrderRequestDto>(baseUrl, `/admin/order-requests/items/${itemId}/lift-suspension`, "POST", { token });
}

// Export Excel trả về file nhị phân (không phải JSON) nên không dùng apiFetch chung - tự fetch
// và trả Blob cho ExportButton (Phase 6.9) tự tạo link download.
export async function exportAdminOrderRequests(
  baseUrl: string,
  status?: OrderRequestStatus,
  token?: string,
): Promise<Blob> {
  const query = status !== undefined ? `?status=${status}` : "";
  const res = await fetch(`${baseUrl}/admin/order-requests/export${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    throw new ApiError(res.status);
  }

  return res.blob();
}
