import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminNewsCategories } from "@/lib/api/admin/news-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { NewsCategoriesManager } from "@/components/admin/news-categories/NewsCategoriesManager";

export const metadata: Metadata = {
  title: "Quản lý danh mục tin tức",
};

export default async function AdminNewsCategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const categories = await getAdminNewsCategories(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <NewsCategoriesManager categories={categories} />
      </div>
    </div>
  );
}
