"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { createAdminAddon, updateAdminAddon, deleteAdminAddon } from "@/lib/api/admin/addons";
import type { AdminAddonDto, CreateAddonDto, UpdateAddonDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createAddonAction(dto: CreateAddonDto): Promise<ActionResult<AdminAddonDto>> {
  try {
    const data = await createAdminAddon(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/addons");
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateAddonAction(id: number, dto: UpdateAddonDto): Promise<ActionResult<AdminAddonDto>> {
  try {
    const data = await updateAdminAddon(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/addons");
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteAddonAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminAddon(getApiUrl(), id, await getToken());
    revalidatePath("/admin/addons");
    revalidatePath("/admin/service-plans");
    revalidateTag("service-plans", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
