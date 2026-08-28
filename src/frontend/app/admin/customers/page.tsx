import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminCustomers } from "@/lib/api/admin/customers";
import { getAdminUsers } from "@/lib/api/admin/users";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { CustomerType } from "@/lib/types/enums";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CustomersFilterBar } from "@/components/admin/customers/CustomersFilterBar";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";

export const metadata: Metadata = {
  title: "Quản lý khách hàng",
};

interface AdminCustomersPageProps {
  searchParams: Promise<{ page?: string; search?: string; customerType?: string; salesRepUserId?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  // GET /admin/customers chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API (dữ liệu PII).
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [customers, salesReps] = await Promise.all([
    getAdminCustomers(
      baseUrl,
      {
        pageNumber,
        pageSize: 20,
        search: params.search || undefined,
        customerType: params.customerType
          ? CustomerType[params.customerType as keyof typeof CustomerType]
          : undefined,
        assignedSalesRepUserId: params.salesRepUserId || undefined,
      },
      token,
    ),
    // Nguồn cho select filter "Sales phụ trách" - tái dùng nguyên GET /admin/users, pageSize lớn để lấy
    // gần như toàn bộ nhân viên (dự án quy mô nhỏ, chưa cần endpoint không phân trang riêng).
    getAdminUsers(baseUrl, { pageSize: 100 }, token),
  ]);

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    if (params.customerType) search.set("customerType", params.customerType);
    if (params.salesRepUserId) search.set("salesRepUserId", params.salesRepUserId);
    search.set("page", String(page));
    return `/admin/customers?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Khách hàng</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Xem thông tin và khoá/mở khoá tài khoản khách hàng tự đăng ký.</p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
          <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
            <CustomersFilterBar
              currentSearch={params.search}
              currentCustomerType={params.customerType}
              currentSalesRepUserId={params.salesRepUserId}
              salesReps={salesReps.items}
            />
          </div>
          <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
            <CustomersTable customers={customers.items} />
          </div>
        </div>

        {customers.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!customers.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = customers.totalPages;
                const current = pageNumber;
                let pages: (number | string)[] = [];

                if (total <= 7) {
                  pages = Array.from({ length: total }, (_, i) => i + 1);
                } else if (current <= 3) {
                  pages = [1, 2, 3, 4, "...", total];
                } else if (current >= total - 2) {
                  pages = [1, "...", total - 3, total - 2, total - 1, total];
                } else {
                  pages = [1, "...", current - 1, current, current + 1, "...", total];
                }

                return pages.map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink href={buildPageHref(page as number)} isActive={page === pageNumber}>
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ));
              })()}
              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(Math.min(customers.totalPages, pageNumber + 1))}
                  aria-disabled={!customers.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
