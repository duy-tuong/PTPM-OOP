"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminSiteSetting,
  updateAdminSiteSetting,
  deleteAdminSiteSetting,
} from "@/lib/api/admin/site-settings";
import type { AdminSiteSettingDto, CreateSiteSettingDto, UpdateSiteSettingDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createSiteSettingAction(dto: CreateSiteSettingDto): Promise<ActionResult<AdminSiteSettingDto>> {
  try {
    const data = await createAdminSiteSetting(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/site-settings");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateSiteSettingAction(
  id: number,
  dto: UpdateSiteSettingDto,
): Promise<ActionResult<AdminSiteSettingDto>> {
  try {
    const data = await updateAdminSiteSetting(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/site-settings");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteSiteSettingAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminSiteSetting(getApiUrl(), id, await getToken());
    revalidatePath("/admin/site-settings");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
