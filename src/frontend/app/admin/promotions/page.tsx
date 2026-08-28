import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminPromotions } from "@/lib/api/admin/promotions";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { getAdminServicePlans } from "@/lib/api/admin/service-plans";
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
import { PromotionsManager } from "@/components/admin/promotions/PromotionsManager";

export const metadata: Metadata = {
  title: "Quản lý khuyến mãi",
};

interface AdminPromotionsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminPromotionsPage({ searchParams }: AdminPromotionsPageProps) {
  // GET /admin/promotions chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  // pageSize lớn để lấy gần như toàn bộ danh mục/gói dịch vụ cho <Select> chọn phạm vi - dự án quy mô
  // nhỏ, chưa cần endpoint "lấy tất cả không phân trang" riêng cho việc này (ServiceCategories/
  // ServicePlans giờ đã phân trang mặc định 20/trang cho chính trang quản lý của chúng).
  const [promotions, categories, plans] = await Promise.all([
    getAdminPromotions(baseUrl, { pageNumber, pageSize: 20, search: params.search || undefined }, token),
    getAdminServiceCategories(baseUrl, { pageSize: 100 }, token),
    getAdminServicePlans(baseUrl, { pageSize: 100 }, token),
  ]);

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    search.set("page", String(page));
    return `/admin/promotions?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <PromotionsManager
          promotions={promotions.items}
          categories={categories.items}
          plans={plans.items}
          currentSearch={params.search}
        />

        {promotions.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!promotions.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = promotions.totalPages;
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
                  href={buildPageHref(Math.min(promotions.totalPages, pageNumber + 1))}
                  aria-disabled={!promotions.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
