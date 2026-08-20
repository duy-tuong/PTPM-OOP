import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { NewsCard } from "@/components/news/NewsCard";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { NewsArticleListItemDto, NewsCategoryDto } from "@/lib/types/content";
import type { PagedResult } from "@/lib/types/common";

// Bố cục "Sticky Split-Screen" cho /tin-tuc - cột trái (35%) sticky chứa H1 + mô tả + nút lọc danh mục
// dọc, cột phải (65%) lưới 3 cột thẻ bài viết. Sticky đơn giản 1 cột trong luồng trang bình thường
// (không phải sticky lồng trong bảng như lỗi từng gặp ở /bang-gia).
//
// Lọc + phân trang + tìm kiếm đều điều khiển qua URL (?category=slug&page=n&search=..., đọc/build ở
// page.tsx và buildHref bên dưới) - KHÔNG có state client: server luôn trả đúng trang/danh mục/từ khoá
// đang xem qua getNewsArticles({categorySlug, search, pageNumber}), tránh lỗi "bài viết biến mất ngoài
// trang đầu" khi số bài vượt xa 1 lần fetch cố định. URL chia sẻ được, crawl được (SEO tốt hơn cho blog).
// Ô tìm kiếm dùng <form method="GET"> HTML thuần (không cần JS/client state) - khớp đúng kiến trúc này.
//
// Mobile: cột trái không đủ chỗ sticky dọc - H1/mô tả render bình thường (không sticky), bộ lọc đổi
// thành thanh ngang cuộn được dính trên đầu (cùng kỹ thuật đã dùng ở ServicesCommandCenter.tsx/
// PricingMatrixTabs.tsx). 2 khối nav (dọc desktop-only / ngang mobile-only) tách riêng như Navbar.tsx
// đã tách desktop nav và mobile Sheet nav - cùng dữ liệu, khác bố cục theo breakpoint.
export function NewsSplitScreen({
  categories,
  articlesResult,
  activeSlug,
  search,
}: {
  categories: NewsCategoryDto[];
  articlesResult: PagedResult<NewsArticleListItemDto>;
  activeSlug: string | null;
  search: string | null;
}) {
  const allCategories: { slug: string | null; name: string }[] = [
    { slug: null, name: "Tất cả" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
      <div className="flex flex-col gap-8 lg:sticky lg:top-32 lg:h-fit lg:w-[35%] lg:self-start">
        <div className="flex flex-col gap-3">
          <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">Tin Tức & Cập Nhật</h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi những thông tin mới nhất về hệ sinh thái Cloudverse và kiến thức hạ tầng.
          </p>
        </div>

        <nav className="hidden flex-col gap-2 lg:flex">
          {allCategories.map((category) => (
            <PillLink
              key={category.slug ?? "all"}
              href={buildHref({ category: category.slug, page: 1, search })}
              active={activeSlug === category.slug}
              className="text-left"
            >
              {category.name}
            </PillLink>
          ))}
        </nav>
      </div>

      <div className="lg:w-[65%]">
        <nav className="sticky top-20 z-30 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-background/80 px-4 py-3 backdrop-blur-sm lg:hidden">
          {allCategories.map((category) => (
            <PillLink
              key={category.slug ?? "all"}
              href={buildHref({ category: category.slug, page: 1, search })}
              active={activeSlug === category.slug}
              className="shrink-0"
            >
              {category.name}
            </PillLink>
          ))}
        </nav>

        <form action="/tin-tuc" method="GET" className="relative mb-6 max-w-sm">
          {activeSlug && <input type="hidden" name="category" value={activeSlug} />}
          <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" name="search" defaultValue={search ?? ""} placeholder="Tìm bài viết..." className="pl-9" />
        </form>

        {articlesResult.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {articlesResult.items.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground">Chưa có bài viết nào.</p>
        )}

        {articlesResult.totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  text="Trước"
                  href={buildHref({ category: activeSlug, page: Math.max(1, articlesResult.pageNumber - 1), search })}
                  aria-disabled={!articlesResult.hasPreviousPage}
                />
              </PaginationItem>
              {buildPageList(articlesResult.pageNumber, articlesResult.totalPages).map((page, index) => (
                <PaginationItem key={`${page}-${index}`}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href={buildHref({ category: activeSlug, page: page as number, search })}
                      isActive={page === articlesResult.pageNumber}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  text="Sau"
                  href={buildHref({
                    category: activeSlug,
                    page: Math.min(articlesResult.totalPages, articlesResult.pageNumber + 1),
                    search,
                  })}
                  aria-disabled={!articlesResult.hasNextPage}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

function buildHref({
  category,
  page,
  search,
}: {
  category: string | null;
  page: number;
  search?: string | null;
}): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  const qs = params.toString();
  return qs ? `/tin-tuc?${qs}` : "/tin-tuc";
}

function buildPageList(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function PillLink({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
