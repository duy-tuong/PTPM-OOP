import type { Metadata } from "next";
import { getNewsCategories, getNewsArticles } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { NewsSplitScreen } from "@/components/news/NewsSplitScreen";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức, khuyến mãi và hướng dẫn mới nhất từ Cloudverse.",
};

const PAGE_SIZE = 12;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Number(params.page) > 0 ? Number(params.page) : 1;
  const activeSlug = params.category || null;
  const search = params.search || null;

  const [categories, articlesResult] = await Promise.all([
    safeFetch(() => getNewsCategories({ revalidate: 3600 }), []),
    safeFetch(
      () =>
        getNewsArticles(
          { categorySlug: activeSlug ?? undefined, search: search ?? undefined, pageNumber, pageSize: PAGE_SIZE },
          { revalidate: 900 },
        ),
      emptyPagedResult(PAGE_SIZE),
    ),
  ]);

  return (
    <NewsSplitScreen categories={categories} articlesResult={articlesResult} activeSlug={activeSlug} search={search} />
  );
}
