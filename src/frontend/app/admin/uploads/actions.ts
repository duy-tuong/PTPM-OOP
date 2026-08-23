"use server";

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { uploadAdminImage } from "@/lib/api/admin/uploads";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

// Dùng chung cho mọi field ảnh trong Admin (ServiceCategoryDialog/NewsArticleForm/TestimonialDialog/
// PartnerDialog qua ImageUploadField.tsx) - không có route.tsx nào trong thư mục này (chỉ actions.ts),
// không tạo trang /admin/uploads nào cả, mirror đúng cách app/admin/partners/actions.ts tổ chức 1
// action riêng theo domain.
export async function uploadImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Vui lòng chọn file ảnh." };
  }

  try {
    const data = await uploadAdminImage(getApiUrl(), file, await getToken());
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
