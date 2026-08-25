"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { createAdminOsImage, updateAdminOsImage, deleteAdminOsImage } from "@/lib/api/admin/os-images";
import type { AdminOsImageDto, CreateOsImageDto, UpdateOsImageDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createOsImageAction(dto: CreateOsImageDto): Promise<ActionResult<AdminOsImageDto>> {
  try {
    const data = await createAdminOsImage(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/os-images");
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateOsImageAction(id: number, dto: UpdateOsImageDto): Promise<ActionResult<AdminOsImageDto>> {
  try {
    const data = await updateAdminOsImage(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/os-images");
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteOsImageAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminOsImage(getApiUrl(), id, await getToken());
    revalidatePath("/admin/os-images");
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
