import Link from "next/link";
import type { NewsArticleListItemDto } from "@/lib/types/content";

// "Được quan tâm nhiều nhất" - dữ liệu thật từ ViewCount (page.tsx fetch getNewsArticles({sort:"popular"}),
// ViewCount đã hết bug đếm trùng - xem NewsArticleService.IncrementViewCountAsync). Ẩn nếu rỗng.
export function PopularArticlesWidget({ articles }: { articles: NewsArticleListItemDto[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">Được quan tâm nhiều nhất</h2>
      <ol className="flex flex-col gap-4">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link href={`/tin-tuc/${article.slug}`} className="group flex items-start gap-3">
              <span className="font-heading text-lg font-bold text-muted-foreground/40 group-hover:text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                  {article.title}
                </span>
                <span className="text-xs text-muted-foreground">{article.viewCount.toLocaleString("vi-VN")} lượt xem</span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
