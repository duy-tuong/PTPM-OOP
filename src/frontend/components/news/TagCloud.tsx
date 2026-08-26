import { PillLink } from "@/components/news/NewsSplitScreen";
import type { NewsTagDto } from "@/lib/types/content";

// "Chủ đề phổ biến" - danh sách tag thật từ GET /api/news-tags (chỉ tag có >=1 bài published, sort theo
// ArticleCount giảm dần - xem NewsTagService). Click tag filter bài viết thật qua ?tag=slug. Ẩn nếu rỗng.
export function TagCloud({
  tags,
  activeTagSlug,
  hrefFor,
}: {
  tags: NewsTagDto[];
  activeTagSlug: string | null;
  hrefFor: (tagSlug: string | null) => string;
}) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">Chủ đề phổ biến</h2>
      <div className="flex flex-wrap gap-2">
        {activeTagSlug && (
          <PillLink href={hrefFor(null)} active={false} className="border border-dashed border-border px-3 py-1 text-xs">
            Xoá bộ lọc ×
          </PillLink>
        )}
        {tags.map((tag) => (
          <PillLink
            key={tag.id}
            href={hrefFor(activeTagSlug === tag.slug ? null : tag.slug)}
            active={activeTagSlug === tag.slug}
            className="px-3 py-1 text-xs"
          >
            #{tag.name}
          </PillLink>
        ))}
      </div>
    </div>
  );
}
