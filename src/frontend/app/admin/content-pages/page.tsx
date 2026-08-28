import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { getAdminContentPages } from "@/lib/api/admin/content-pages";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ContentPagesTable } from "@/components/admin/content-pages/ContentPagesTable";
import { ContentPagesFilterBar } from "@/components/admin/content-pages/ContentPagesFilterBar";

export const metadata: Metadata = {
  title: "Quản lý trang nội dung",
};

interface AdminContentPagesPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminContentPagesPage({ searchParams }: AdminContentPagesPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const pages = await getAdminContentPages(
    getApiUrl(),
    { pageNumber, pageSize: 20, search: params.search || undefined },
    token,
  );

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.search) search.set("search", params.search);
    search.set("page", String(page));
    return `/admin/content-pages?${search.toString()}`;
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Trang nội dung</h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Quản lý các trang tĩnh như Giới thiệu, Điều khoản, Chính sách...
            </p>
          </div>
          <Button
            className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
            nativeButton={false}
            render={
              <Link href="/admin/content-pages/new">
                <Plus className="size-4" data-icon="inline-start" />
                Thêm trang
              </Link>
            }
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
          <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
            <ContentPagesFilterBar currentSearch={params.search} />
          </div>
          <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
            <ContentPagesTable pages={pages.items} />
          </div>
        </div>

        {pages.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!pages.hasPreviousPage}
                />
              </PaginationItem>
              {(() => {
                const total = pages.totalPages;
                const current = pageNumber;
                let pageList: (number | string)[] = [];

                if (total <= 7) {
                  pageList = Array.from({ length: total }, (_, i) => i + 1);
                } else if (current <= 3) {
                  pageList = [1, 2, 3, 4, "...", total];
                } else if (current >= total - 2) {
                  pageList = [1, "...", total - 3, total - 2, total - 1, total];
                } else {
                  pageList = [1, "...", current - 1, current, current + 1, "...", total];
                }

                return pageList.map((page, index) => (
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
                  href={buildPageHref(Math.min(pages.totalPages, pageNumber + 1))}
                  aria-disabled={!pages.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
