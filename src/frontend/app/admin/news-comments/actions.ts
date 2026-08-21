"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { updateAdminNewsCommentApproval, deleteAdminNewsComment } from "@/lib/api/admin/news-comments";
import type { AdminNewsCommentDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function updateNewsCommentApprovalAction(
  id: number,
  isApproved: boolean,
): Promise<ActionResult<AdminNewsCommentDto>> {
  try {
    const data = await updateAdminNewsCommentApproval(getApiUrl(), id, { isApproved }, await getToken());
    revalidatePath("/admin/news-comments");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteNewsCommentAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminNewsComment(getApiUrl(), id, await getToken());
    revalidatePath("/admin/news-comments");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
