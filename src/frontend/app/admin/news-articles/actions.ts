"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { getApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  createAdminNewsArticle,
  updateAdminNewsArticle,
  deleteAdminNewsArticle,
} from "@/lib/api/admin/news-articles";
import type { AdminNewsArticleDto, CreateNewsArticleDto, UpdateNewsArticleDto } from "@/lib/types/admin";

type ActionResult<T> = { success: true; data: T } | { success: false; message: string };

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
}

export async function createNewsArticleAction(
  dto: CreateNewsArticleDto,
): Promise<ActionResult<AdminNewsArticleDto>> {
  try {
    const data = await createAdminNewsArticle(getApiUrl(), dto, await getToken());
    revalidatePath("/admin/news-articles");
    revalidateTag("news-articles", "max");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function updateNewsArticleAction(
  id: number,
  dto: UpdateNewsArticleDto,
): Promise<ActionResult<AdminNewsArticleDto>> {
  try {
    const data = await updateAdminNewsArticle(getApiUrl(), id, dto, await getToken());
    revalidatePath("/admin/news-articles");
    revalidatePath(`/admin/news-articles/${id}/edit`);
    revalidatePath("/", "layout");
    return { success: true, data };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}

export async function deleteNewsArticleAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteAdminNewsArticle(getApiUrl(), id, await getToken());
    revalidatePath("/admin/news-articles");
    revalidateTag("news-articles", "max");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.message };
    throw error;
  }
}
