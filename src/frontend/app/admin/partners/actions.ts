"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { createAdminPartner, updateAdminPartner, deleteAdminPartner } from "@/lib/api/admin/partners";
import type { AdminPartnerDto, CreatePartnerDto, UpdatePartnerDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createPartnerAction(dto: CreatePartnerDto): Promise<ActionResult<AdminPartnerDto>> {
  try {
    const data = await createAdminPartner(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/partners");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updatePartnerAction(
  id: number,
  dto: UpdatePartnerDto,
): Promise<ActionResult<AdminPartnerDto>> {
  try {
    const data = await updateAdminPartner(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/partners");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deletePartnerAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminPartner(getApiUrl(), id, await getToken());
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
