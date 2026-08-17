import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { getAdminServicePlans } from "@/lib/api/admin/service-plans";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ServicePlansFilterBar } from "@/components/admin/service-plans/ServicePlansFilterBar";
import { ServicePlansTable } from "@/components/admin/service-plans/ServicePlansTable";

export const metadata: Metadata = {
  title: "Quản lý gói dịch vụ",
};

interface AdminServicePlansPageProps {
  searchParams: Promise<{ page?: string; categorySlug?: string; isFeatured?: string }>;
}

export default async function AdminServicePlansPage({ searchParams }: AdminServicePlansPageProps) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [plans, categories] = await Promise.all([
    getAdminServicePlans(
      baseUrl,
      {
        pageNumber,
        pageSize: 20,
        categorySlug: params.categorySlug || undefined,
        isFeatured: params.isFeatured === "true" ? true : undefined,
      },
      token,
    ),
    getAdminServiceCategories(baseUrl, token),
  ]);

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  function buildPageHref(page: number) {
    const search = new URLSearchParams();
    if (params.categorySlug) search.set("categorySlug", params.categorySlug);
    if (params.isFeatured) search.set("isFeatured", params.isFeatured);
    search.set("page", String(page));
    return `/admin/service-plans?${search.toString()}`;
  }

  return (
    <div className="min-h-full bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-gray-900">Gói dịch vụ</h1>
            <p className="mt-1 text-sm text-gray-500">Quản lý gói VPS/Hosting/... kèm tính năng và mức giá.</p>
          </div>
          <Button
            nativeButton={false}
            render={
              <Link href="/admin/service-plans/new">
                <Plus className="size-4" data-icon="inline-start" />
                Thêm gói dịch vụ
              </Link>
            }
          />
        </div>

        <ServicePlansFilterBar
          categories={categories}
          currentCategorySlug={params.categorySlug}
          currentIsFeatured={params.isFeatured}
        />

        <ServicePlansTable plans={plans.items} categoryNameById={categoryNameById} />

        {plans.totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(Math.max(1, pageNumber - 1))}
                  aria-disabled={!plans.hasPreviousPage}
                />
              </PaginationItem>
              {Array.from({ length: plans.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink href={buildPageHref(page)} isActive={page === pageNumber}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(Math.min(plans.totalPages, pageNumber + 1))}
                  aria-disabled={!plans.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
