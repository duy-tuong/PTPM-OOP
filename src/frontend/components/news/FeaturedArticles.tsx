import Link from "next/link";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { formatDate } from "@/lib/utils";
import type { NewsArticleListItemDto } from "@/lib/types/content";

// "Bài viết nổi bật" - dùng field isFeatured thật (NewsArticle.IsFeatured, Đợt 6) do Admin tự đánh dấu
// qua NewsArticleForm.tsx, KHÔNG đoán qua vị trí/ngày đăng. Ẩn hẳn nếu chưa có bài nào được đánh dấu -
// tránh khung rỗng, đúng pattern ServiceWhyChooseFeatures.tsx (Đợt 4). Bài đầu tiên (mới nhất trong số
// featured, do page.tsx fetch với sort mặc định) làm bài chính lớn, tối đa 2 bài tiếp theo làm bài phụ.
export function FeaturedArticles({ articles }: { articles: NewsArticleListItemDto[] }) {
  if (articles.length === 0) {
    return null;
  }

  const [main, ...secondary] = articles;
  const secondaryArticles = secondary.slice(0, 2);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4 pb-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 font-heading text-xl font-bold text-foreground">Đáng chú ý</h2>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Link
          href={`/tin-tuc/${main.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary sm:flex-row lg:col-span-2"
        >
          <div className="h-44 shrink-0 overflow-hidden sm:h-auto sm:w-2/5">
            <FallbackImage
              src={main.thumbnailUrl}
              alt={main.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackClassName="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-medium text-primary"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 p-5 sm:justify-center">
            <span className="w-fit rounded bg-muted px-2 py-1 font-mono text-xs text-muted-foreground uppercase">
              {main.categoryName}
            </span>
            <h3 className="font-heading text-xl font-bold text-foreground">{main.title}</h3>
            {main.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{main.summary}</p>}
            <span className="text-xs text-muted-foreground/70">
              {formatDate(main.publishedAt)} • {main.viewCount} lượt xem • {main.authorName}
            </span>
            <span className="mt-1 w-fit text-sm font-medium text-primary">Đọc bài viết →</span>
          </div>
        </Link>

        <div className="flex flex-col gap-5">
          {secondaryArticles.map((article) => (
            <Link
              key={article.id}
              href={`/tin-tuc/${article.slug}`}
              className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary"
            >
              <div className="aspect-square size-20 shrink-0 overflow-hidden rounded-lg">
                <FallbackImage
                  src={article.thumbnailUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  fallbackClassName="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-medium text-primary"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-center gap-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">{article.categoryName}</span>
                <h4 className="line-clamp-2 text-sm font-semibold text-foreground">{article.title}</h4>
                <span className="text-xs text-muted-foreground/70">{formatDate(article.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
