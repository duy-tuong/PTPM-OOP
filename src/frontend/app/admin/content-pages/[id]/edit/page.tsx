import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/api/config";
import { getAdminContentPages } from "@/lib/api/admin/content-pages";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ContentPageForm } from "@/components/admin/content-pages/ContentPageForm";

export const metadata: Metadata = {
  title: "Sửa trang nội dung",
};

interface AdminEditContentPagePageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditContentPagePage({ params }: AdminEditContentPagePageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  // Không có API GET /admin/content-pages/{id} (list phẳng, không phân trang) - lấy nguyên list rồi
  // tự tìm theo id. Chấp nhận được vì số Content Page rất ít (vài trang tĩnh).
  const pages = await getAdminContentPages(getApiUrl(), token);
  const page = pages.find((p) => p.id === Number(id));

  if (!page) notFound();

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Sửa trang nội dung</h1>
          <p className="mt-1 text-[14px] text-zinc-500">{page.title}</p>
        </div>
        <ContentPageForm mode="edit" initialData={page} />
      </div>
    </div>
  );
}
