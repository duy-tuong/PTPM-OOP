import Link from "next/link";
import { cookies } from "next/headers";
import { Newspaper, MessageCircle, PenLine, HelpCircle } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { getAdminNewsArticles } from "@/lib/api/admin/news-articles";
import { getAdminNewsComments } from "@/lib/api/admin/news-comments";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { MetricCard } from "@/components/admin/MetricCard";
import { PublishBadge } from "@/components/admin/PublishBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { AdminNewsArticleDto, AdminNewsCommentDto } from "@/lib/types/admin";
import type { ComponentType } from "react";

interface QuickActionCardProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

function QuickActionCard({ href, label, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group relative rounded-[24px] bg-white p-1.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.05)]"
    >
      <div className="flex h-full flex-col items-center gap-3 rounded-[18px] bg-zinc-50/50 p-6 text-center ring-1 ring-zinc-950/5 transition-colors group-hover:bg-white">
        <div className="flex size-10 items-center justify-center rounded-full bg-white ring-1 ring-zinc-950/5 shadow-sm">
          <Icon className="size-5 text-zinc-700" />
        </div>
        <span className="text-sm font-medium text-zinc-900">{label}</span>
      </div>
    </Link>
  );
}

function RecentArticlesTable({ articles }: { articles: AdminNewsArticleDto[] }) {
  if (articles.length === 0) {
    return (
      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-950/5">
        Chưa có bài viết nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200/60 bg-zinc-50/50 hover:bg-zinc-50/50">
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Tiêu đề</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Trạng thái</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Ngày</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors">
              <TableCell className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900">{article.title}</span>
                  <span className="text-xs text-zinc-500">{article.slug}</span>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4">
                <PublishBadge isPublished={article.isPublished} />
              </TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-zinc-500">{formatDate(article.publishedAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RecentCommentsTable({ comments }: { comments: AdminNewsCommentDto[] }) {
  if (comments.length === 0) {
    return (
      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm ring-1 ring-zinc-950/5">
        Chưa có bình luận nào.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200/60 bg-zinc-50/50 hover:bg-zinc-50/50">
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Nội dung</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Người gửi</TableHead>
            <TableHead className="h-12 px-6 text-xs font-semibold text-zinc-500">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={comment.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors">
              <TableCell className="px-6 py-4">
                <span className="line-clamp-2 text-[14px] text-zinc-700">{comment.content}</span>
              </TableCell>
              <TableCell className="px-6 py-4 text-[14px] text-zinc-700">{comment.authorDisplayName}</TableCell>
              <TableCell className="px-6 py-4">
                {comment.isApproved ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 ring-1 ring-inset ring-emerald-500/20">
                    <div className="size-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[12px] font-medium text-emerald-700">Đã duyệt</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-inset ring-amber-500/20">
                    <div className="size-1.5 rounded-full bg-amber-500" />
                    <span className="text-[12px] font-medium text-amber-700">Chờ duyệt</span>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Dashboard riêng cho Editor - thay hẳn nội dung Admin (KPI đơn hàng/chart) bằng số liệu và lối tắt
// liên quan tới công việc thật của Editor (Bài viết/Bình luận/FAQ). Tự fetch dữ liệu (không nhận
// props từ page.tsx) để gói gọn toàn bộ logic Editor-dashboard trong 1 file.
export async function EditorDashboardView() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [articles, comments] = await Promise.all([
    getAdminNewsArticles(baseUrl, { pageSize: 5 }, token),
    getAdminNewsComments(baseUrl, { pageSize: 5 }, token),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label="Tổng số bài viết" value={articles.totalCount} icon={Newspaper} />
        <MetricCard label="Tổng số bình luận" value={comments.totalCount} icon={MessageCircle} />
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">Lối tắt</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickActionCard href="/admin/news-articles" label="Viết bài mới" icon={PenLine} />
          <QuickActionCard href="/admin/news-comments" label="Duyệt bình luận" icon={MessageCircle} />
          <QuickActionCard href="/admin/faqs" label="Quản lý FAQs" icon={HelpCircle} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">Bài viết mới cập nhật</h2>
          <RecentArticlesTable articles={articles.items} />
        </div>
        <div>
          <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">Bình luận mới nhất</h2>
          <RecentCommentsTable comments={comments.items} />
        </div>
      </div>
    </div>
  );
}
