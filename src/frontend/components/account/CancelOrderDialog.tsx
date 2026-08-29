"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { MyOrderRequestDto } from "@/lib/types/sales";


// Đợt 13, Phần 1 (A2) - khách tự huỷ 1 đơn CHƯA thanh toán của chính mình (backend chỉ cho phép khi
// status còn New/Contacted/Confirmed - nơi gọi (MyOrderRow.tsx) đã lọc đúng điều kiện này trước khi
// render component, nhưng backend vẫn là nguồn xác thực cuối cùng nếu trạng thái vừa đổi ở tab khác).
// Mirror cấu trúc RenewServiceDialog.tsx.
export function CancelOrderDialog({ order }: { order: MyOrderRequestDto }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    async function handleConfirm() {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/order-requests/${order.id}/cancel`, { method: "POST" });


            if (!res.ok) {
                const data = (await res.json().catch(() => null)) as { message?: string } | null;
                throw new Error(data?.message ?? "Huỷ đơn thất bại, vui lòng thử lại.");
            }


            setOpen(false);
            toast.success("Đã huỷ đơn hàng");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Huỷ đơn thất bại, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" variant="destructive" />}>Huỷ đơn</DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Huỷ đơn hàng {order.orderCode}?</DialogTitle>
                </DialogHeader>


                <p className="py-2 text-sm text-muted-foreground">
                    Hành động này không thể hoàn tác. Nếu vẫn muốn dịch vụ này, bạn sẽ cần đặt lại đơn hàng mới.
                </p>


                <DialogFooter>
                    <Button onClick={handleConfirm} disabled={isSubmitting} variant="destructive" className="rounded-full">
                        {isSubmitting ? "Đang huỷ..." : "Xác nhận huỷ đơn"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
