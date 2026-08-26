import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsArticleBySlug, getNewsRelatedArticles, getNewsComments } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { ApiError } from "@/lib/api/http";
import { estimateReadingMinutes, extractHeadings } from "@/lib/utils";
import { NewsArticleDetail } from "@/components/news/NewsArticleDetail";
import type { NewsArticleDetailDto } from "@/lib/types/content";

// Fetch theo slug KHÔNG bọc safeFetch (khác các fetch phụ bên dưới - bình luận/bài liên quan) - xem
// comment lib/api/safe.ts: trang chi tiết theo slug phải báo lỗi rõ ràng (notFound cho 404 thật), không
// âm thầm ẩn dữ liệu thiếu.
async function loadArticle(slug: string): Promise<NewsArticleDetailDto> {
  try {
    return await getNewsArticleBySlug(slug, { revalidate: 900 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getNewsArticleBySlug(slug, { revalidate: 900 });
    const images = article.thumbnailUrl ? [article.thumbnailUrl] : undefined;
    return {
      title: article.title,
      description: article.summary ?? undefined,
      openGraph: {
        title: article.title,
        description: article.summary ?? undefined,
        type: "article",
        publishedTime: article.publishedAt,
        images,
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.summary ?? undefined,
        images,
      },
    };
  } catch {
    return {};
  }
}

export default async function NewsArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await loadArticle(slug);

  const headings = extractHeadings(article.content);
  const readingMinutes = estimateReadingMinutes(article.wordCount);

  const [comments, relatedArticles] = await Promise.all([
    safeFetch(() => getNewsComments(article.id, { revalidate: 60 }), []),
    // Backend chấm điểm category+tag trùng (NewsArticleService.GetRelatedAsync, Đợt 6) - thay cho cách
    // filter/slice thủ công theo category cũ, không phân biệt được số tag trùng.
    safeFetch(() => getNewsRelatedArticles(article.slug, 3, { revalidate: 900 }), []),
  ]);

  return (
    <NewsArticleDetail
      article={article}
      headings={headings}
      readingMinutes={readingMinutes}
      comments={comments}
      relatedArticles={relatedArticles}
    />
  );
}
