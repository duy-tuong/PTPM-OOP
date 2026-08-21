"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { createAdminUser, updateAdminUser, resetAdminUserPassword, deleteAdminUser } from "@/lib/api/admin/users";
import type { AdminUserDto, CreateUserDto, UpdateUserDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createUserAction(dto: CreateUserDto): Promise<ActionResult<AdminUserDto>> {
  try {
    const data = await createAdminUser(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/users");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateUserAction(id: string, dto: UpdateUserDto): Promise<ActionResult<AdminUserDto>> {
  try {
    const data = await updateAdminUser(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/users");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function resetUserPasswordAction(
  id: string,
  newPassword: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    await resetAdminUserPassword(getApiUrl(), id, { newPassword }, await getToken());
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteUserAction(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminUser(getApiUrl(), id, await getToken());
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
