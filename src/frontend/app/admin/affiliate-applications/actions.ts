"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { updateAdminAffiliateApplicationStatus } from "@/lib/api/admin/affiliate-applications";
import type { AdminAffiliateApplicationDto, UpdateAffiliateApplicationStatusDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function updateAffiliateApplicationStatusAction(
  id: number,
  dto: UpdateAffiliateApplicationStatusDto,
): Promise<ActionResult<AdminAffiliateApplicationDto>> {
  try {
    const data = await updateAdminAffiliateApplicationStatus(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/affiliate-applications");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
