"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminNewsCategory,
  updateAdminNewsCategory,
  deleteAdminNewsCategory,
} from "@/lib/api/admin/news-categories";
import type { AdminNewsCategoryDto, CreateNewsCategoryDto, UpdateNewsCategoryDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createNewsCategoryAction(
  dto: CreateNewsCategoryDto,
): Promise<ActionResult<AdminNewsCategoryDto>> {
  try {
    const data = await createAdminNewsCategory(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/news-categories");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateNewsCategoryAction(
  id: number,
  dto: UpdateNewsCategoryDto,
): Promise<ActionResult<AdminNewsCategoryDto>> {
  try {
    const data = await updateAdminNewsCategory(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/news-categories");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteNewsCategoryAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminNewsCategory(getApiUrl(), id, await getToken());
    revalidatePath("/admin/news-categories");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
