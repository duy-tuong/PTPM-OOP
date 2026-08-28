import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminNewsCategories } from "@/lib/api/admin/news-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { NewsArticleForm } from "@/components/admin/news-articles/NewsArticleForm";

export const metadata: Metadata = {
  title: "Thêm bài viết",
};

export default async function AdminNewNewsArticlePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  // pageSize lớn để lấy gần như toàn bộ danh mục cho <Select> chọn trong form - dự án quy mô nhỏ, chưa
  // cần endpoint "lấy tất cả không phân trang" riêng cho việc này.
  const categories = await getAdminNewsCategories(getApiUrl(), { pageSize: 100 }, token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Thêm bài viết</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Soạn bài viết mới cho trang Tin tức.</p>
        </div>
        <NewsArticleForm mode="create" categories={categories.items} />
      </div>
    </div>
  );
}
