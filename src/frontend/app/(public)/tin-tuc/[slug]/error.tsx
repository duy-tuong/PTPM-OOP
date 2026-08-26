"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Mirror app/(public)/tin-tuc/error.tsx - riêng cho trang chi tiết bài viết (thường bắt lỗi thật sự từ
// loadArticle() khi backend lỗi khác 404 - 404 thật đã đi qua notFound() ở page.tsx, không tới đây).
export default function NewsArticleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[tin-tuc/slug] Lỗi tải bài viết:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-xl font-bold text-foreground">Không thể tải bài viết.</p>
      <p className="text-sm text-muted-foreground">Đã có lỗi xảy ra khi tải nội dung bài viết. Vui lòng thử lại.</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
