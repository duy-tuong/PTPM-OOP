"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateCustomerActiveStatusAction } from "@/app/admin/customers/actions";

interface CustomerActiveStatusButtonProps {
  id: string;
  fullName: string;
  isActive: boolean;
}

// Mirror NewsCommentApprovalActions.tsx - 1 hành động đổi boolean, không cần Dialog. Chỉ confirm khi
// khoá (hành động nhạy cảm hơn), mở khoá thì thao tác thẳng.
export function CustomerActiveStatusButton({ id, fullName, isActive }: CustomerActiveStatusButtonProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleToggle(nextActive: boolean) {
    if (!nextActive && !window.confirm(`Khoá tài khoản "${fullName}"?`)) return;

    setIsUpdating(true);
    try {
      const result = await updateCustomerActiveStatusAction(id, nextActive);
      if (result.success) {
        toast.success(nextActive ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
        router.refresh();
      } else {
        toast.error(result.message ?? "Cập nhật thất bại, vui lòng thử lại");
      }
    } finally {
      setIsUpdating(false);
    }
  }

  if (isActive) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleToggle(false)}
        disabled={isUpdating}
        aria-label={`Khoá ${fullName}`}
        className="text-zinc-400 hover:text-red-500 transition-colors"
      >
        <Lock className="size-3.5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => handleToggle(true)}
      disabled={isUpdating}
      aria-label={`Mở khoá ${fullName}`}
      className="text-zinc-400 hover:text-emerald-600 transition-colors"
    >
      <Unlock className="size-3.5" />
    </Button>
  );
}
