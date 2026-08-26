import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { NewsCard } from "@/components/news/NewsCard";
import { FeaturedArticles } from "@/components/news/FeaturedArticles";
import { PopularArticlesWidget } from "@/components/news/PopularArticlesWidget";
import { TagCloud } from "@/components/news/TagCloud";
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
import type { NewsArticleListItemDto, NewsCategoryDto, NewsTagDto } from "@/lib/types/content";
import type { PagedResult } from "@/lib/types/common";

const SORT_OPTIONS = [
  { value: null, label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "popular", label: "Phổ biến nhất" },
];

// Bố cục "Sticky Split-Screen" cho /tin-tuc - cột trái (35%) sticky chứa H1 + mô tả + nút lọc danh mục
// dọc + widget "Được quan tâm nhiều nhất" + "Chủ đề phổ biến", cột phải (65%) lưới 3 cột thẻ bài viết.
// Sticky đơn giản 1 cột trong luồng trang bình thường (không phải sticky lồng trong bảng như lỗi từng
// gặp ở /bang-gia).
//
// Lọc + phân trang + tìm kiếm + tag + sort đều điều khiển qua URL (?category=&page=&search=&tag=&sort=,
// đọc/build ở page.tsx và buildHref bên dưới) - KHÔNG có state client: server luôn trả đúng trang/danh
// mục/từ khoá/tag/sắp xếp đang xem, tránh lỗi "bài viết biến mất ngoài trang đầu" khi số bài vượt xa 1
// lần fetch cố định. URL chia sẻ được, crawl được (SEO tốt hơn cho blog). Ô tìm kiếm dùng
// <form method="GET"> HTML thuần (không cần JS/client state) - khớp đúng kiến trúc này; KHÔNG đổi sang
// debounce (xem lý do trong plan Đợt 6 - codebase không có pattern debounce nào, đổi sẽ phá nguyên tắc
// "100% URL-driven" đang áp dụng nhất quán ở đây).
//
// Mọi href đều mang theo đủ 5 chiều lọc hiện tại (category/page/search/tag/sort), chỉ đổi đúng 1 chiều
// mà link đó điều khiển - giữ các bộ lọc khác nguyên vẹn khi bấm 1 link bất kỳ.
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
  featuredArticles,
  popularArticles,
  tags,
  activeTagSlug,
  sort,
}: {
  categories: NewsCategoryDto[];
  articlesResult: PagedResult<NewsArticleListItemDto>;
  activeSlug: string | null;
  search: string | null;
  featuredArticles: NewsArticleListItemDto[];
  popularArticles: NewsArticleListItemDto[];
  tags: NewsTagDto[];
  activeTagSlug: string | null;
  sort: string | null;
}) {
  const allCategories: { slug: string | null; name: string }[] = [
    { slug: null, name: "Tất cả" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  const hrefFor = (overrides: Partial<HrefParams>) =>
    buildHref({ category: activeSlug, page: 1, search, tag: activeTagSlug, sort, ...overrides });

  return (
    <>
      <FeaturedArticles articles={featuredArticles} />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:gap-12 lg:px-8">
        <div className="flex flex-col gap-8 lg:sticky lg:top-32 lg:h-fit lg:w-[35%] lg:self-start">
          <div className="flex flex-col gap-3">
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Tin Tức & Cập Nhật</h1>
            <p className="text-sm text-muted-foreground">
              Cập nhật kiến thức, ưu đãi và những thông tin mới nhất từ hệ sinh thái Cloudverse.
            </p>
          </div>

          <nav className="hidden flex-col gap-2 lg:flex">
            {allCategories.map((category) => (
              <PillLink
                key={category.slug ?? "all"}
                href={hrefFor({ category: category.slug })}
                active={activeSlug === category.slug}
                className="text-left"
              >
                {category.name}
              </PillLink>
            ))}
          </nav>

          <PopularArticlesWidget articles={popularArticles} />
          <TagCloud tags={tags} activeTagSlug={activeTagSlug} hrefFor={(tagSlug) => hrefFor({ tag: tagSlug })} />
        </div>

        <div className="lg:w-[65%]">
          <nav className="sticky top-20 z-30 -mx-4 mb-6 flex gap-2 overflow-x-auto bg-background/80 px-4 py-3 backdrop-blur-sm lg:hidden">
            {allCategories.map((category) => (
              <PillLink
                key={category.slug ?? "all"}
                href={hrefFor({ category: category.slug })}
                active={activeSlug === category.slug}
                className="shrink-0"
              >
                {category.name}
              </PillLink>
            ))}
          </nav>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <form action="/tin-tuc" method="GET" className="relative max-w-sm flex-1">
              {activeSlug && <input type="hidden" name="category" value={activeSlug} />}
              {activeTagSlug && <input type="hidden" name="tag" value={activeTagSlug} />}
              {sort && <input type="hidden" name="sort" value={sort} />}
              <MagnifyingGlass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" name="search" defaultValue={search ?? ""} placeholder="Tìm bài viết..." className="pl-9" />
            </form>

            <div className="flex shrink-0 gap-1 rounded-full border border-border bg-muted/30 p-1">
              {SORT_OPTIONS.map((option) => (
                <PillLink
                  key={option.value ?? "latest"}
                  href={hrefFor({ sort: option.value })}
                  active={(sort ?? null) === option.value}
                  className="px-3 py-1.5 text-xs"
                >
                  {option.label}
                </PillLink>
              ))}
            </div>
          </div>

          {articlesResult.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {articlesResult.items.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="font-medium text-foreground">Không tìm thấy bài viết</p>
              <p className="text-sm text-muted-foreground">Hiện chưa có bài viết phù hợp với lựa chọn của bạn.</p>
              <Link href="/tin-tuc" className="mt-2 text-sm font-medium text-primary hover:underline">
                Xem tất cả bài viết
              </Link>
            </div>
          )}

          {articlesResult.totalPages > 1 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    text="Trước"
                    href={hrefFor({ page: Math.max(1, articlesResult.pageNumber - 1) })}
                    aria-disabled={!articlesResult.hasPreviousPage}
                  />
                </PaginationItem>
                {buildPageList(articlesResult.pageNumber, articlesResult.totalPages).map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink href={hrefFor({ page: page as number })} isActive={page === articlesResult.pageNumber}>
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    text="Sau"
                    href={hrefFor({ page: Math.min(articlesResult.totalPages, articlesResult.pageNumber + 1) })}
                    aria-disabled={!articlesResult.hasNextPage}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </>
  );
}

interface HrefParams {
  category: string | null;
  page: number;
  search?: string | null;
  tag?: string | null;
  sort?: string | null;
}

function buildHref({ category, page, search, tag, sort }: HrefParams): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  if (search) params.set("search", search);
  if (tag) params.set("tag", tag);
  if (sort) params.set("sort", sort);
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

export function PillLink({
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
