import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/api/config";
import { getAdminServicePlanById } from "@/lib/api/admin/service-plans";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ApiError } from "@/lib/api/http";
import { ServicePlanForm } from "@/components/admin/service-plans/ServicePlanForm";

export const metadata: Metadata = {
  title: "Sửa gói dịch vụ",
};

interface AdminEditServicePlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditServicePlanPage({ params }: AdminEditServicePlanPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [plan, categories] = await Promise.all([
    getAdminServicePlanById(baseUrl, Number(id), token).catch((error) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    getAdminServiceCategories(baseUrl, token),
  ]);

  if (!plan) notFound();

  return (
    <div className="min-h-full bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">Sửa gói dịch vụ</h1>
          <p className="mt-1 text-sm text-gray-500">{plan.name}</p>
        </div>
        <ServicePlanForm mode="edit" initialData={plan} categories={categories} />
      </div>
    </div>
  );
}
