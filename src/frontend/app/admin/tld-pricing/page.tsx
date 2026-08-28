import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminTldPricing } from "@/lib/api/admin/tld-pricing";
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
import { TldPricingManager } from "@/components/admin/tld-pricing/TldPricingManager";

export const metadata: Metadata = {
  title: "Quản lý bảng giá tên miền",
};

interface AdminTldPricingPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminTldPricingPage({ searchParams }: AdminTldPricingPageProps) {
  // GET /admin/tld-pricing chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  // pageSize lớn để lấy gần như toàn bộ danh mục cho <Select> "Danh mục áp dụng khuyến mãi" - dự án quy
  // mô nhỏ, chưa cần endpoint "lấy tất cả không phân trang" riêng cho việc này.
  const [tldPricing, categories] = await Promise.all([
    getAdminTldPricing(baseUrl, { pageNumber, pageSize: 20 }, token),
    getAdminServiceCategories(baseUrl, { pageSize: 100 }, token),
  ]);

  function buildPageHref(page: number) {
    return `/admin/tld-pricing?page=${page}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <TldPricingManager tldPricing={tldPricing.items} categories={categories.items} />

        {tldPricing.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!tldPricing.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = tldPricing.totalPages;
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
                  href={buildPageHref(Math.min(tldPricing.totalPages, pageNumber + 1))}
                  aria-disabled={!tldPricing.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
