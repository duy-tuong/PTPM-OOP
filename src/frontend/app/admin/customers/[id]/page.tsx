import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiUrl } from "@/lib/api/config";
import { getAdminCustomerById } from "@/lib/api/admin/customers";
import { getAdminUsers } from "@/lib/api/admin/users";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerDetailForm } from "@/components/admin/customers/CustomerDetailForm";
import { ApiError } from "@/lib/api/http";
import { CUSTOMER_TYPE_LABELS } from "@/lib/types/enums";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Chi tiết khách hàng",
};

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: AdminCustomerDetailPageProps) {
  // GET /admin/customers/{id} chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API (dữ liệu PII +
  // CRM B2B nhạy cảm hơn cả list, mirror app/admin/customers/page.tsx).
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  let customer;
  try {
    customer = await getAdminCustomerById(baseUrl, id, token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Danh sách nhân viên (Admin/Editor) làm nguồn cho select "Sales phụ trách" - tái dùng nguyên API
  // GET /admin/users đã có sẵn cho trang Nhân viên, không cần endpoint riêng.
  const salesReps = await getAdminUsers(baseUrl, token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">{customer.fullName}</h1>
          <p className="mt-1 text-[14px] text-zinc-500">{customer.email}</p>
        </div>

        <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Thông tin tài khoản</h2>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Điện thoại</span>
              <span className="font-medium text-zinc-900">{customer.phone || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Loại khách hàng</span>
              <span className="font-medium text-zinc-900">{CUSTOMER_TYPE_LABELS[customer.customerType] ?? customer.customerType}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Công ty</span>
              <span className="font-medium text-zinc-900">{customer.companyName || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Mã số thuế</span>
              <span className="font-medium text-zinc-900">{customer.taxCode || "-"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Trạng thái</span>
              <StatusBadge isActive={customer.isActive} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500">Ngày đăng ký</span>
              <span className="font-medium text-zinc-900">{formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        <CustomerDetailForm customer={customer} salesReps={salesReps} />
      </div>
    </div>
  );
}
