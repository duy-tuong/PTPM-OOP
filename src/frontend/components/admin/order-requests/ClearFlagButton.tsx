"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearOrderRequestFlagAction } from "@/app/admin/order-requests/actions";

// Fraud Review (Đợt 10, Phần 2) - Admin xác nhận đơn không gian lận sau khi kiểm tra thủ công, tắt cờ
// IsFlaggedForReview để đơn được đưa trở lại luồng tự động (AutoAddFromQuery/OrderAutoProvisioning bỏ
// qua đơn đang bị cờ), mirror chính xác LiftSuspensionButton.tsx.
export function ClearFlagButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);
    try {
      const result = await clearOrderRequestFlagAction(orderId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Đã bỏ đánh dấu nghi vấn");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-red-500 hover:text-red-700 transition-colors"
      aria-label="Bỏ đánh dấu nghi vấn"
      disabled={isSubmitting}
      onClick={handleClick}
    >
      <ShieldCheck className="size-3.5" />
    </Button>
  );
}
