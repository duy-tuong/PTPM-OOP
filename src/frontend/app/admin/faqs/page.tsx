import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminFaqs } from "@/lib/api/admin/faqs";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { FaqsManager } from "@/components/admin/faqs/FaqsManager";

export const metadata: Metadata = {
  title: "Quản lý câu hỏi thường gặp",
};

export default async function AdminFaqsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [faqs, categories] = await Promise.all([
    getAdminFaqs(baseUrl, token),
    getAdminServiceCategories(baseUrl, token),
  ]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <FaqsManager faqs={faqs} categories={categories} />
      </div>
    </div>
  );
}
