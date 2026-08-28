import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminFaqs } from "@/lib/api/admin/faqs";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
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
import { FaqsManager } from "@/components/admin/faqs/FaqsManager";

export const metadata: Metadata = {
  title: "Quản lý câu hỏi thường gặp",
};

interface AdminFaqsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminFaqsPage({ searchParams }: AdminFaqsPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [faqs, categories] = await Promise.all([
    getAdminFaqs(baseUrl, { pageNumber, pageSize: 20, search: params.search || undefined }, token),
    // pageSize lớn để lấy gần như toàn bộ danh mục cho <Select> chọn category của FAQ - dự án quy mô
    // nhỏ, chưa cần endpoint "lấy tất cả không phân trang" riêng cho việc này.
    getAdminServiceCategories(baseUrl, { pageSize: 100 }, token),
  ]);

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    search.set("page", String(page));
    return `/admin/faqs?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <FaqsManager faqs={faqs.items} categories={categories.items} currentSearch={params.search} />

        {faqs.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!faqs.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = faqs.totalPages;
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
                  href={buildPageHref(Math.min(faqs.totalPages, pageNumber + 1))}
                  aria-disabled={!faqs.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
