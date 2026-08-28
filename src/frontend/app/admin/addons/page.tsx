import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminAddons } from "@/lib/api/admin/addons";
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
import { AddonsManager } from "@/components/admin/addons/AddonsManager";

export const metadata: Metadata = {
  title: "Quản lý tiện ích mua kèm",
};

interface AdminAddonsPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminAddonsPage({ searchParams }: AdminAddonsPageProps) {
  // Toàn bộ AdminAddonsController chỉ [Authorize(Roles="Admin")] (kể cả GetList, khác ServiceCategories)
  // - chặn trước khi gọi API.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const addons = await getAdminAddons(
    getApiUrl(),
    { pageNumber, pageSize: 20, search: params.search || undefined },
    token
  );

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    search.set("page", String(page));
    return `/admin/addons?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <AddonsManager addons={addons.items} currentSearch={params.search} />

        {addons.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!addons.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = addons.totalPages;
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
                  href={buildPageHref(Math.min(addons.totalPages, pageNumber + 1))}
                  aria-disabled={!addons.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
