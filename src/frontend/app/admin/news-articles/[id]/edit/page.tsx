import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/api/config";
import { getAdminNewsArticleById } from "@/lib/api/admin/news-articles";
import { getAdminNewsCategories } from "@/lib/api/admin/news-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ApiError } from "@/lib/api/http";
import { NewsArticleForm } from "@/components/admin/news-articles/NewsArticleForm";

export const metadata: Metadata = {
  title: "Sửa bài viết",
};

interface AdminEditNewsArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditNewsArticlePage({ params }: AdminEditNewsArticlePageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [article, categories] = await Promise.all([
    getAdminNewsArticleById(baseUrl, Number(id), token).catch((error) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    getAdminNewsCategories(baseUrl, token),
  ]);

  if (!article) notFound();

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Sửa bài viết</h1>
          <p className="mt-1 text-[14px] text-zinc-500">{article.title}</p>
        </div>
        <NewsArticleForm mode="edit" initialData={article} categories={categories} />
      </div>
    </div>
  );
}
