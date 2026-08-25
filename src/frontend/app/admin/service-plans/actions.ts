"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminServicePlan,
  updateAdminServicePlan,
  deleteAdminServicePlan,
} from "@/lib/api/admin/service-plans";
import type { AdminServicePlanDto, CreateServicePlanDto, UpdateServicePlanDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createServicePlanAction(
  dto: CreateServicePlanDto,
): Promise<ActionResult<AdminServicePlanDto>> {
  try {
    const data = await createAdminServicePlan(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateServicePlanAction(
  id: number,
  dto: UpdateServicePlanDto,
): Promise<ActionResult<AdminServicePlanDto>> {
  try {
    const data = await updateAdminServicePlan(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/service-plans");
    revalidatePath(`/admin/service-plans/${id}/edit`);
    revalidatePath("/", "layout");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteServicePlanAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminServicePlan(getApiUrl(), id, await getToken());
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
