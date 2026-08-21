"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { readCustomerSessionCookie } from "@/lib/auth/customerSessionClient";
import type { CustomerSessionUser } from "@/lib/types/customerAuth";

// Form gửi bình luận - đọc session khách hàng (đã có sẵn, cùng cách Navbar.tsx dùng) trong useEffect để
// ẩn ô Tên/Email khi đã đăng nhập (backend tự lấy tên thật từ Customer, bỏ qua field này nếu gửi kèm).
// Gọi qua Route Handler same-origin app/api/news-comments/route.ts (không gọi thẳng backend từ client -
// tránh CORS, đúng pattern customer-auth). Bình luận mới luôn vào hàng chờ duyệt - không hiện ngay lập
// tức trong danh sách, chỉ báo qua toast.
export function CommentForm({ articleId }: { articleId: number }) {
  const [session, setSession] = useState<CustomerSessionUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function syncSession() {
      setSession(readCustomerSessionCookie());
    }
    syncSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/news-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsArticleId: articleId,
          content,
          authorName: session ? undefined : name,
          authorEmail: session ? undefined : email || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gửi bình luận thất bại, vui lòng thử lại.");
      }

      toast.success("Đã gửi bình luận, đang chờ duyệt");
      setContent("");
      setName("");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi bình luận thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      {!session && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" required />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (tuỳ chọn)"
          />
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận..."
        required
        rows={3}
        className={cn(
          "w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-[15px] transition-colors outline-none",
          "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
      />
      <Button type="submit" disabled={submitting} className="w-fit">
        {submitting ? "Đang gửi..." : "Gửi bình luận"}
      </Button>
    </form>
  );
}
