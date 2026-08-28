import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ServiceCategoriesManager } from "@/components/admin/service-categories/ServiceCategoriesManager";

export const metadata: Metadata = {
  title: "Quản lý danh mục dịch vụ",
};

interface AdminServiceCategoriesPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminServiceCategoriesPage({ searchParams }: AdminServiceCategoriesPageProps) {
  // AdminServiceCategoriesController: class-level [Authorize(Roles="Admin,Editor")], CHỈ Create/Update/
  // Delete tự override riêng thành [Authorize(Roles="Admin")] - GetList KHÔNG bị override nên Editor vẫn
  // gọi được bình thường. Trước đây trang này chặn hẳn Editor (dựa trên giả định sai là GetList cũng
  // Admin-only) - sửa lại đúng: Editor vẫn xem được danh sách, chỉ ẩn nút Thêm/Sửa/Xoá qua prop
  // `canManage` (xem ServiceCategoriesManager.tsx).
  const session = await getAdminSession();
  if (!session) {
    return <AccessDenied />;
  }
  const canManage = session.roles.includes("Admin");

  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const categories = await getAdminServiceCategories(
    getApiUrl(),
    { pageNumber, pageSize: 20, search: params.search || undefined },
    token
  );

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    search.set("page", String(page));
    return `/admin/service-categories?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <ServiceCategoriesManager categories={categories.items} canManage={canManage} currentSearch={params.search} />

        {categories.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!categories.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = categories.totalPages;
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
                  href={buildPageHref(Math.min(categories.totalPages, pageNumber + 1))}
                  aria-disabled={!categories.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
