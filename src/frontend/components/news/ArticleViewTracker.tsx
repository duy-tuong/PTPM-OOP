"use client";

import { useEffect, useRef } from "react";

// Gọi Route Handler /api/news-view (không gọi thẳng backend) - dedup ViewCount thật sự xảy ra ở đó qua
// cookie httpOnly (xem app/api/news-view/route.ts). useRef chặn double-fire ở React StrictMode (dev)
// và khi component re-render vì lý do khác slug/articleId. Không render gì (return null).
export function ArticleViewTracker({ articleId, slug }: { articleId: number; slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch("/api/news-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId, slug }),
    }).catch(() => {
      // Tracking phụ, không cần báo lỗi cho người đọc.
    });
  }, [articleId, slug]);

  return null;
}
