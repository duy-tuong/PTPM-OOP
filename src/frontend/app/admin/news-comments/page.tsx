import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminNewsComments } from "@/lib/api/admin/news-comments";
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
import { NewsCommentsFilterBar } from "@/components/admin/news-comments/NewsCommentsFilterBar";
import { NewsCommentsTable } from "@/components/admin/news-comments/NewsCommentsTable";

export const metadata: Metadata = {
  title: "Quản lý bình luận",
};

interface AdminNewsCommentsPageProps {
  searchParams: Promise<{ page?: string; isApproved?: string }>;
}

export default async function AdminNewsCommentsPage({ searchParams }: AdminNewsCommentsPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const comments = await getAdminNewsComments(
    baseUrl,
    {
      pageNumber,
      pageSize: 20,
      isApproved: params.isApproved === undefined ? undefined : params.isApproved === "true",
    },
    token,
  );

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.isApproved) search.set("isApproved", params.isApproved);
    search.set("page", String(page));
    return `/admin/news-comments?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Bình luận</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Kiểm duyệt bình luận của khách trên các bài viết.</p>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
          <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
            <NewsCommentsFilterBar currentIsApproved={params.isApproved} />
          </div>
          <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
            <NewsCommentsTable comments={comments.items} />
          </div>
        </div>

        {comments.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!comments.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = comments.totalPages;
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
                  href={buildPageHref(Math.min(comments.totalPages, pageNumber + 1))}
                  aria-disabled={!comments.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
