"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { createAdminFaq, updateAdminFaq, deleteAdminFaq } from "@/lib/api/admin/faqs";
import type { AdminFaqDto, CreateFaqDto, UpdateFaqDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createFaqAction(dto: CreateFaqDto): Promise<ActionResult<AdminFaqDto>> {
  try {
    const data = await createAdminFaq(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/faqs");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateFaqAction(id: number, dto: UpdateFaqDto): Promise<ActionResult<AdminFaqDto>> {
  try {
    const data = await updateAdminFaq(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/faqs");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteFaqAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminFaq(getApiUrl(), id, await getToken());
    revalidatePath("/admin/faqs");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
