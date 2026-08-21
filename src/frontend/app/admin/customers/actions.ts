"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { updateAdminCustomerActiveStatus } from "@/lib/api/admin/customers";
import type { AdminCustomerDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function updateCustomerActiveStatusAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult<AdminCustomerDto>> {
  try {
    const data = await updateAdminCustomerActiveStatus(getApiUrl(), id, { isActive }, await getToken());
    revalidatePath("/admin/customers");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
