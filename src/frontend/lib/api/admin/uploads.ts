import { ApiError } from "../http";
import type { ProblemDetails } from "@/lib/types/common";

// Không đi qua apiFetch dùng chung (../http.ts) - hàm đó luôn JSON.stringify() body và set
// Content-Type: application/json, không hỗ trợ multipart/form-data. Tự dựng 1 lệnh fetch riêng ở đây,
// KHÔNG set Content-Type thủ công - trình duyệt/Node tự thêm boundary đúng khi body là FormData.
export async function uploadAdminImage(baseUrl: string, file: File, token?: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/admin/uploads/images`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let problem: ProblemDetails | undefined;
    try {
      problem = (await res.json()) as ProblemDetails;
    } catch {
      // response không có body JSON - bỏ qua, ApiError vẫn có status
    }
    throw new ApiError(res.status, problem);
  }

  return (await res.json()) as { url: string };
}
