import type { PagedResult } from "@/lib/types/common";

// Bọc an toàn cho các lệnh fetch dữ liệu công khai ở Server Component (trang chủ, ...): nếu backend
// tạm gián đoạn (không chạy, timeout, lỗi mạng...) thì trả về `fallback` thay vì ném lỗi làm sập cả
// trang (Next.js render lỗi 500 toàn trang nếu 1 Server Component throw không bắt). Chỉ dùng cho các
// section mang tính "trang trí/bổ sung" (chấp nhận được khi thiếu), không dùng cho luồng bắt buộc
// (vd trang chi tiết theo slug - thiếu dữ liệu ở đó phải báo lỗi rõ ràng, không nên âm thầm ẩn đi).
export async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[safeFetch] Backend request failed, rendering fallback:", error);
    return fallback;
  }
}

export function emptyPagedResult<T>(pageSize = 20): PagedResult<T> {
  return {
    items: [],
    pageNumber: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
