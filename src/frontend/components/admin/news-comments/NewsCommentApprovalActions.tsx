"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateNewsCommentApprovalAction } from "@/app/admin/news-comments/actions";

interface NewsCommentApprovalActionsProps {
  id: number;
  isApproved: boolean;
}

// Khác các resource khác: đây là hành động đổi 1 boolean (duyệt/ẩn), không cần Dialog - 2 nút trực
// tiếp trong hàng, mirror độ đơn giản của ConfirmDeleteButton.tsx.
export function NewsCommentApprovalActions({ id, isApproved }: NewsCommentApprovalActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle(nextApproved: boolean) {
    setIsUpdating(true);
    try {
      const result = await updateNewsCommentApprovalAction(id, nextApproved);
      if (result.success) {
        toast.success(nextApproved ? "Đã duyệt bình luận" : "Đã ẩn bình luận");
        router.refresh();
      } else {
        toast.error(result.message ?? "Cập nhật thất bại, vui lòng thử lại");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  if (isApproved) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleToggle(false)}
        disabled={isUpdating}
        aria-label="Ẩn bình luận"
        className="text-zinc-400 hover:text-amber-600 transition-colors"
      >
        <EyeOff className="size-3.5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => handleToggle(true)}
      disabled={isUpdating}
      aria-label="Duyệt bình luận"
      className="text-zinc-400 hover:text-emerald-600 transition-colors"
    >
      <Check className="size-3.5" />
    </Button>
  );
}
