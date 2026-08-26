import Link from "next/link";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { estimateReadingMinutes, formatDate } from "@/lib/utils";
import type { NewsArticleListItemDto } from "@/lib/types/content";

// Tách từ NewsSplitScreen.tsx - dùng chung cho lưới danh sách (/tin-tuc) và section "Bài viết liên quan"
// (/tin-tuc/[slug]).
export function NewsCard({ article }: { article: NewsArticleListItemDto }) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary"
    >
      <div className="aspect-video overflow-hidden">
        <FallbackImage
          src={article.thumbnailUrl}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackClassName="flex h-full w-full items-center justify-center bg-primary/10 text-2xl font-medium text-primary"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground uppercase">
          {article.categoryName}
        </span>
        <h3 className="font-heading line-clamp-2 text-base font-semibold text-foreground">{article.title}</h3>
        {article.summary && <p className="line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>}
        {article.authorName && <span className="text-xs text-muted-foreground">{article.authorName}</span>}
        <span className="mt-auto pt-2 text-xs text-muted-foreground/70">
          {formatDate(article.publishedAt)} • {estimateReadingMinutes(article.wordCount)} phút đọc • {article.viewCount} lượt xem
        </span>
      </div>
    </Link>
  );
}
