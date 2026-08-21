import { CommentForm } from "@/components/news/CommentForm";
import { formatDate } from "@/lib/utils";
import type { NewsCommentDto } from "@/lib/types/content";

// Danh sách bình luận (Server Component - comments đã fetch sẵn ở page.tsx) + form gửi bình luận mới.
// Bình luận mới luôn IsApproved=false ở backend nên KHÔNG xuất hiện ngay sau khi gửi - đây là hành vi
// đúng (chờ Admin duyệt qua /admin/news-comments), không phải bug.
function countAll(comments: NewsCommentDto[]): number {
  return comments.reduce((total, c) => total + 1 + countAll(c.replies), 0);
}

export function CommentSection({ articleId, comments }: { articleId: number; comments: NewsCommentDto[] }) {
  return (
    <section className="mt-20 border-t border-border pt-12">
      <h2 className="font-heading text-2xl font-bold text-foreground">Bình luận ({countAll(comments)})</h2>
      <CommentForm articleId={articleId} />

      <div className="mt-8 flex flex-col gap-6">
        {comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </section>
  );
}

function CommentItem({ comment }: { comment: NewsCommentDto }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{comment.authorDisplayName}</span>
        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="text-sm text-muted-foreground">{comment.content}</p>
      {comment.replies.length > 0 && (
        <div className="mt-2 flex flex-col gap-4 border-l border-border pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
