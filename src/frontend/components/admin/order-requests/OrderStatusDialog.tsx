"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderRequestStatusAction, assignOrderRequestAction } from "@/app/admin/order-requests/actions";
import { OrderRequestStatus, ORDER_REQUEST_STATUS_LABELS } from "@/lib/types/enums";
import { formatOrderItemLabel } from "@/lib/utils/orderItems";
import { formatCurrency } from "@/lib/utils";
import type { AdminOrderRequestDto, AdminUserDto } from "@/lib/types/admin";

const NO_ASSIGNEE_VALUE = "none";

interface OrderStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AdminOrderRequestDto | null;
  // Rỗng nếu người xem không phải Admin (GET /admin/users chỉ Admin gọi được) - ẩn hẳn Select "Người
  // phụ trách" trong trường hợp đó, xem comment ở page.tsx.
  staffUsers: AdminUserDto[];
}

// Cho chọn tự do cả 5 giá trị (không disable option nào) - backend tự chặn transition không hợp lệ
// (đơn đã Hoàn tất/Đã huỷ không cho chuyển tiếp, xem AdminOrderRequestService.UpdateStatusAsync) và trả
// lỗi rõ ràng qua toast nếu chọn sai, không cần UI đoán trước state-machine.
export function OrderStatusDialog({ open, onOpenChange, order, staffUsers }: OrderStatusDialogProps) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<OrderRequestStatus>(OrderRequestStatus.New);
  const [initialStatus, setInitialStatus] = useState<OrderRequestStatus>(OrderRequestStatus.New);
  // Người phụ trách (Đợt 10, Phần 1) - value dạng string cho Select, null gán trở lại thành "Chưa gán".
  const [assignedToUserId, setAssignedToUserId] = useState(NO_ASSIGNEE_VALUE);
  const [initialAssignedToUserId, setInitialAssignedToUserId] = useState(NO_ASSIGNEE_VALUE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncFromOrder() {
      if (open && order) {
        const status = OrderRequestStatus[order.status as keyof typeof OrderRequestStatus] ?? OrderRequestStatus.New;
        const assignee = order.assignedToUserId ?? NO_ASSIGNEE_VALUE;
        setNewStatus(status);
        setInitialStatus(status);
        setAssignedToUserId(assignee);
        setInitialAssignedToUserId(assignee);
      }
    }
    syncFromOrder();
  }, [open, order]);

  async function handleSubmit() {
    if (!order) return;

    setIsSubmitting(true);
    try {
      // Chỉ gọi đúng action(s) tương ứng với field thực sự thay đổi - tránh gọi API thừa khi Admin chỉ
      // đổi 1 trong 2 (đổi trạng thái, hoặc chỉ gán lại người phụ trách).
      if (newStatus !== initialStatus) {
        const result = await updateOrderRequestStatusAction(order.id, { newStatus });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
      }

      if (assignedToUserId !== initialAssignedToUserId) {
        const result = await assignOrderRequestAction(order.id, {
          assignedToUserId: assignedToUserId === NO_ASSIGNEE_VALUE ? null : assignedToUserId,
        });
        if (!result.success) {
          toast.error(result.message);
          return;
        }
      }

      if (newStatus === initialStatus && assignedToUserId === initialAssignedToUserId) {
        onOpenChange(false);
        return;
      }

      toast.success("Đã cập nhật đơn hàng");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
        </DialogHeader>

        <FieldGroup className="py-4">
          <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Mã đơn</span>
              <span className="font-mono font-medium text-zinc-900">{order.orderCode}</span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span className="text-zinc-500">Khách hàng</span>
              <span className="font-medium text-zinc-900">{order.customerName}</span>
            </div>
            <div className="mt-1 flex flex-col gap-1">
              <span className="text-zinc-500">Sản phẩm</span>
              <ul className="flex flex-col gap-0.5">
                {order.items.map((item) => (
                  <li key={item.id} className="font-medium text-zinc-900">
                    {formatOrderItemLabel(item)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span className="text-zinc-500">Tổng tiền</span>
              <span className="font-mono font-medium text-zinc-900">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          <Field>
            <Label htmlFor="order-new-status">Trạng thái mới</Label>
            <Select
              items={Object.entries(ORDER_REQUEST_STATUS_LABELS).map(([key, label]) => ({
                value: String(OrderRequestStatus[key as keyof typeof OrderRequestStatus]),
                label,
              }))}
              value={String(newStatus)}
              onValueChange={(value) => setNewStatus(Number(value) as OrderRequestStatus)}
            >
              <SelectTrigger id="order-new-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORDER_REQUEST_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={String(OrderRequestStatus[key as keyof typeof OrderRequestStatus])}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {staffUsers.length > 0 && (
            <Field>
              <Label htmlFor="order-assignee">Người phụ trách</Label>
              <Select value={assignedToUserId} onValueChange={(v) => setAssignedToUserId(v ?? NO_ASSIGNEE_VALUE)}>
                <SelectTrigger id="order-assignee" className="w-full">
                  <SelectValue placeholder="Chưa gán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_ASSIGNEE_VALUE}>Chưa gán</SelectItem>
                  {staffUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </FieldGroup>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
          >
            {isSubmitting ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
