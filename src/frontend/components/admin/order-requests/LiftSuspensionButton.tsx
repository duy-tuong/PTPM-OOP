"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { liftOrderRequestItemSuspensionAction } from "@/app/admin/order-requests/actions";

// Dunning Automation (Đợt 2, Phần 8) - Admin gỡ tạm khóa thủ công khi xác nhận đã nhận tiền ngoài luồng
// tự động (vd chuyển khoản không qua PayOS). itemId là OrderRequestItem.Id (không phải id đơn hàng).
export function LiftSuspensionButton({ itemId }: { itemId: number }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    try {
      const result = await liftOrderRequestItemSuspensionAction(itemId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Đã gỡ tạm khóa dịch vụ");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-orange-500 hover:text-orange-700 transition-colors"
      aria-label="Gỡ tạm khóa dịch vụ"
      disabled={isSubmitting}
      onClick={handleClick}
    >
      <LockOpen className="size-3.5" />
    </Button>
  );
}
