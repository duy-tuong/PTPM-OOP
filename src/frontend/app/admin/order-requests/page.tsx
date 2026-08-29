import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminOrderRequests } from "@/lib/api/admin/order-requests";
import { getAdminUsers } from "@/lib/api/admin/users";
import { getAdminSession } from "@/lib/auth/adminSession";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { OrderRequestsFilterBar } from "@/components/admin/order-requests/OrderRequestsFilterBar";
import { OrderRequestsTable } from "@/components/admin/order-requests/OrderRequestsTable";
import { ExportButton } from "@/components/admin/order-requests/ExportButton";
import { OrderRequestStatus } from "@/lib/types/enums";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng",
};

interface AdminOrderRequestsPageProps {
  searchParams: Promise<{ page?: string; status?: string; flaggedOnly?: string; search?: string }>;
}

export default async function AdminOrderRequestsPage({ searchParams }: AdminOrderRequestsPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [orders, session] = await Promise.all([
    getAdminOrderRequests(
      baseUrl,
      {
        pageNumber,
        pageSize: 20,
        status: params.status
          ? OrderRequestStatus[params.status as keyof typeof OrderRequestStatus]
          : undefined,
        flaggedOnly: params.flaggedOnly === "true" ? true : undefined,
        search: params.search || undefined,
      },
      token,
    ),
    getAdminSession(),
  ]);

  const isAdmin = session?.roles.includes("Admin") ?? false;

  // Danh sách nhân viên (Đợt 10, Phần 1 - gán người phụ trách) - GET /admin/users chỉ [Authorize(Roles=
  // "Admin")], khác resource order-requests cho phép cả Admin/Editor (mirror lý do ExportButton chỉ hiện
  // với Admin) - Editor không thấy Select "Người phụ trách" trong OrderStatusDialog.
  const staffUsers = isAdmin ? (await getAdminUsers(baseUrl, { pageSize: 100 }, token)).items : [];

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.flaggedOnly === "true") search.set("flaggedOnly", "true");
    if (params.search) search.set("search", params.search);
    search.set("page", String(page));
    return `/admin/order-requests?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Đơn hàng</h1>
            <p className="mt-1 text-[14px] text-zinc-500">Quản lý yêu cầu đặt dịch vụ và cập nhật trạng thái xử lý.</p>
          </div>
          {isAdmin && <ExportButton status={params.status} />}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
          <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
            <OrderRequestsFilterBar
              currentStatus={params.status}
              flaggedOnly={params.flaggedOnly === "true"}
              currentSearch={params.search}
            />
          </div>
          <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
            <OrderRequestsTable orders={orders.items} staffUsers={staffUsers} />
          </div>
        </div>

        {orders.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!orders.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = orders.totalPages;
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
                  href={buildPageHref(Math.min(orders.totalPages, pageNumber + 1))}
                  aria-disabled={!orders.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
