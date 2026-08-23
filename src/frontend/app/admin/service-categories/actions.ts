"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminServiceCategory,
  updateAdminServiceCategory,
  deleteAdminServiceCategory,
} from "@/lib/api/admin/service-categories";
import type { AdminServiceCategoryDto, CreateServiceCategoryDto, UpdateServiceCategoryDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createServiceCategoryAction(
  dto: CreateServiceCategoryDto,
): Promise<ActionResult<AdminServiceCategoryDto>> {
  try {
    const data = await createAdminServiceCategory(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/service-categories");
    revalidateTag("service-categories");
    revalidateTag("service-plans");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateServiceCategoryAction(
  id: number,
  dto: UpdateServiceCategoryDto,
): Promise<ActionResult<AdminServiceCategoryDto>> {
  try {
    const data = await updateAdminServiceCategory(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/service-categories");
    revalidateTag("service-categories");
    revalidateTag("service-plans");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteServiceCategoryAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminServiceCategory(getApiUrl(), id, await getToken());
    revalidatePath("/admin/service-categories");
    revalidateTag("service-categories");
    revalidateTag("service-plans");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
