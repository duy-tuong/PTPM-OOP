import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArticleToc } from "@/components/news/ArticleToc";
import { ArticleSidebar } from "@/components/news/ArticleSidebar";
import { ReadingProgressBar } from "@/components/news/ReadingProgressBar";
import { CommentSection } from "@/components/news/CommentSection";
import { NewsCard } from "@/components/news/NewsCard";
import { markdownComponents } from "@/lib/markdown-components";
import { formatDate } from "@/lib/utils";
import type { ArticleHeading } from "@/lib/utils";
import type { NewsArticleDetailDto, NewsArticleListItemDto, NewsCommentDto } from "@/lib/types/content";

// Bố cục "Tech Docs" 3 cột (TOC 20% - Nội dung 60% - Sidebar 20%) cho /tin-tuc/[slug]. Cột giữa bọc
// max-w-prose (giới hạn ~65 ký tự/dòng cho dễ đọc). content là Markdown thật (Admin soạn qua
// MarkdownEditor.tsx) - render qua markdownComponents dùng chung (lib/markdown-components.tsx, cũng
// được AboutStory.tsx tái sử dụng).

export function NewsArticleDetail({
  article,
  headings,
  readingMinutes,
  comments,
  relatedArticles,
}: {
  article: NewsArticleDetailDto;
  headings: ArticleHeading[];
  readingMinutes: number;
  comments: NewsCommentDto[];
  relatedArticles: NewsArticleListItemDto[];
}) {
  return (
    <div className="relative">
      <ReadingProgressBar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-12 gap-y-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_3fr_1fr] lg:px-8">
        <ArticleToc headings={headings} />

        <article className="max-w-prose lg:col-start-2 lg:mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>
            {" / "}
            <Link href="/tin-tuc" className="hover:text-foreground">
              Tin tức
            </Link>
            {" / "}
            <span className="text-foreground">{article.title}</span>
          </nav>

          <span className="w-fit rounded bg-muted px-3 py-1 text-xs font-medium text-foreground uppercase">
            {article.categoryName}
          </span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-foreground sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {formatDate(article.publishedAt)} • {readingMinutes} phút đọc • {article.viewCount} lượt xem
          </p>

          <div className="mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {article.content}
            </ReactMarkdown>
          </div>

          <CommentSection articleId={article.id} comments={comments} />
        </article>

        <ArticleSidebar tags={article.tags} />
      </div>

      {relatedArticles.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 font-heading text-2xl font-bold text-foreground">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {relatedArticles.map((related) => (
              <NewsCard key={related.id} article={related} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
