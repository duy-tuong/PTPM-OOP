import type { Metadata } from "next";
import { getNewsCategories, getNewsArticles, getNewsTags } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { NewsSplitScreen } from "@/components/news/NewsSplitScreen";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Cập nhật kiến thức, ưu đãi và những thông tin mới nhất từ hệ sinh thái Cloudverse.",
};

const PAGE_SIZE = 12;

// Đợt 6 - fetch 1 lần duy nhất (Promise.all) mọi dữ liệu cần cho trang, bao gồm 3 fetch "trang trí bổ
// sung" mới (featured/popular/tags, đều safeFetch, tự ẩn ở NewsSplitScreen nếu rỗng - không có section
// nào dùng dữ liệu bịa).
export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; search?: string; tag?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const activeSlug = params.category || null;
  const search = params.search || null;
  const activeTagSlug = params.tag || null;
  const sort = params.sort || null;

  const [categories, articlesResult, featuredResult, popularResult, tags] = await Promise.all([
    safeFetch(() => getNewsCategories({ revalidate: 3600 }), []),
    safeFetch(
      () =>
        getNewsArticles(
          { categorySlug: activeSlug ?? undefined, tagSlug: activeTagSlug ?? undefined, search: search ?? undefined, sort: sort ?? undefined, pageNumber, pageSize: PAGE_SIZE },
          { revalidate: 900 },
        ),
      emptyPagedResult(PAGE_SIZE),
    ),
    safeFetch(() => getNewsArticles({ featured: true, pageSize: 3 }, { revalidate: 3600 }), emptyPagedResult(3)),
    safeFetch(() => getNewsArticles({ sort: "popular", pageSize: 5 }, { revalidate: 1800 }), emptyPagedResult(5)),
    safeFetch(() => getNewsTags(15, { revalidate: 3600 }), []),
  ]);

  return (
    <NewsSplitScreen
      categories={categories}
      articlesResult={articlesResult}
      activeSlug={activeSlug}
      search={search}
      featuredArticles={featuredResult.items}
      popularArticles={popularResult.items}
      tags={tags}
      activeTagSlug={activeTagSlug}
      sort={sort}
    />
  );
}
