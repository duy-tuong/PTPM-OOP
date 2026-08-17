"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  itemLabel: string;
  onConfirm: () => Promise<{ success: boolean; message?: string }>;
}

// Dùng window.confirm() thay vì dựng AlertDialog riêng (components/ui/ chưa có alert-dialog.tsx) -
// đủ dùng cho phạm vi đồ án, tránh over-engineer. Tái dùng cho Phase 6.8/6.9.
export function ConfirmDeleteButton({ itemLabel, onConfirm }: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Xoá "${itemLabel}"? Hành động này không thể hoàn tác.`)) return;

    setIsDeleting(true);
    try {
      const result = await onConfirm();
      if (result.success) {
        toast.success("Đã xoá thành công");
        router.refresh();
      } else {
        toast.error(result.message ?? "Xoá thất bại, vui lòng thử lại");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleClick} disabled={isDeleting} aria-label={`Xoá ${itemLabel}`}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
