import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminAuditLogs } from "@/lib/api/admin/audit-logs";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ApiError } from "@/lib/api/http";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AuditLogsFilterBar } from "@/components/admin/audit-logs/AuditLogsFilterBar";
import { AuditLogsTable } from "@/components/admin/audit-logs/AuditLogsTable";

export const metadata: Metadata = {
  title: "Nhật ký hệ thống",
};

interface AdminAuditLogsPageProps {
  searchParams: Promise<{ page?: string; entityName?: string }>;
}

export default async function AdminAuditLogsPage({ searchParams }: AdminAuditLogsPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  // GET /admin/audit-logs chỉ [Authorize(Roles="Admin")] - Editor đăng nhập được nhưng không có
  // quyền xem, mirror đúng pattern đã dùng ở Dashboard (Phase 6.6) thay vì để lỗi tràn trang.
  const logs = await getAdminAuditLogs(
    baseUrl,
    { pageNumber, pageSize: 20, entityName: params.entityName || undefined },
    token,
  ).catch((error) => {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.entityName) search.set("entityName", params.entityName);
    search.set("page", String(page));
    return `/admin/audit-logs?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Nhật ký hệ thống</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Theo dõi lịch sử thay đổi trạng thái và dữ liệu quan trọng.</p>
        </div>

        {logs ? (
          <>
            <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
              <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
                <AuditLogsFilterBar currentEntityName={params.entityName} />
              </div>
              <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
                <AuditLogsTable logs={logs.items} />
              </div>
            </div>

            {logs.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={buildPageHref(Math.max(1, pageNumber - 1))}
                      aria-disabled={!logs.hasPreviousPage}
                    />
                  </PaginationItem>
                  {(() => {
                    const total = logs.totalPages;
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
                      href={buildPageHref(Math.min(logs.totalPages, pageNumber + 1))}
                      aria-disabled={!logs.hasNextPage}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="rounded-[24px] border border-zinc-200/60 bg-white p-6 text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-950/5">
            Chỉ Admin mới xem được nhật ký hệ thống.
          </div>
        )}
      </div>
    </div>
  );
}
