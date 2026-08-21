"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminContentPage,
  updateAdminContentPage,
  deleteAdminContentPage,
} from "@/lib/api/admin/content-pages";
import type { AdminContentPageDto, CreateContentPageDto, UpdateContentPageDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createContentPageAction(
  dto: CreateContentPageDto,
): Promise<ActionResult<AdminContentPageDto>> {
  try {
    const data = await createAdminContentPage(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/content-pages");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateContentPageAction(
  id: number,
  dto: UpdateContentPageDto,
): Promise<ActionResult<AdminContentPageDto>> {
  try {
    const data = await updateAdminContentPage(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/content-pages");
    revalidatePath(`/admin/content-pages/${id}/edit`);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteContentPageAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminContentPage(getApiUrl(), id, await getToken());
    revalidatePath("/admin/content-pages");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
