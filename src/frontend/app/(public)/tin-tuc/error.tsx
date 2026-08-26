"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Pattern error.tsx đầu tiên trong toàn dự án (trước đây mọi trang public đều dựa vào safeFetch để âm
// thầm fallback rỗng, không có route nào thật sự phân biệt "lỗi" với "rỗng"). Chỉ bắt lỗi KHÔNG được
// safeFetch nuốt - tức lỗi thật sự nghiêm trọng (vd getServicePlanBySlug 404 thật đã throw có chủ đích
// ở trang [slug]). Tối giản, không tích hợp error-reporting service (ngoài phạm vi BTL).
export default function NewsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[tin-tuc] Lỗi tải dữ liệu:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-xl font-bold text-foreground">Không thể tải bảng tin.</p>
      <p className="text-sm text-muted-foreground">Đã có lỗi xảy ra khi tải dữ liệu bài viết. Vui lòng thử lại.</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
