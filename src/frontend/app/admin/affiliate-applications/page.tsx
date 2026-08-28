import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminAffiliateApplications } from "@/lib/api/admin/affiliate-applications";
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
import { AffiliateApplicationsManager } from "@/components/admin/affiliate-applications/AffiliateApplicationsManager";

export const metadata: Metadata = {
  title: "Quản lý đăng ký affiliate",
};

interface AdminAffiliateApplicationsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAffiliateApplicationsPage({ searchParams }: AdminAffiliateApplicationsPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const applications = await getAdminAffiliateApplications(getApiUrl(), { pageNumber, pageSize: 20 }, token);

  function buildPageHref(page: number) {
    return `/admin/affiliate-applications?page=${page}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Đăng ký affiliate</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Duyệt đăng ký trở thành đối tác tiếp thị liên kết.</p>
        </div>
        <AffiliateApplicationsManager applications={applications.items} />

        {applications.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!applications.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = applications.totalPages;
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
                  href={buildPageHref(Math.min(applications.totalPages, pageNumber + 1))}
                  aria-disabled={!applications.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
