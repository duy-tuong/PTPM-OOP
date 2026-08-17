"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateConsultationRequestStatusAction } from "@/app/admin/consultation-requests/actions";
import { ConsultationStatus, CONSULTATION_STATUS_LABELS } from "@/lib/types/enums";
import type { AdminConsultationRequestDto } from "@/lib/types/admin";

interface ConsultationStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AdminConsultationRequestDto | null;
}

export function ConsultationStatusDialog({ open, onOpenChange, request }: ConsultationStatusDialogProps) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<ConsultationStatus>(ConsultationStatus.New);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncStatus() {
      if (open && request) {
        setNewStatus(ConsultationStatus[request.status as keyof typeof ConsultationStatus] ?? ConsultationStatus.New);
      }
    }
    syncStatus();
  }, [open, request]);

  async function handleSubmit() {
    if (!request) return;

    setIsSubmitting(true);
    try {
      const result = await updateConsultationRequestStatusAction(request.id, { newStatus });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Đã cập nhật trạng thái yêu cầu tư vấn");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái yêu cầu tư vấn</DialogTitle>
        </DialogHeader>

        <FieldGroup className="py-4">
          <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Mã yêu cầu</span>
              <span className="font-mono font-medium text-zinc-900">{request.requestCode}</span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span className="text-zinc-500">Người gửi</span>
              <span className="font-medium text-zinc-900">{request.fullName}</span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span className="text-zinc-500">Chủ đề</span>
              <span className="max-w-[60%] text-right font-medium text-zinc-900">{request.subject}</span>
            </div>
          </div>

          <Field>
            <Label htmlFor="consultation-new-status">Trạng thái mới</Label>
            <Select
              value={String(newStatus)}
              onValueChange={(value) => setNewStatus(Number(value) as ConsultationStatus)}
            >
              <SelectTrigger id="consultation-new-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONSULTATION_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={String(ConsultationStatus[key as keyof typeof ConsultationStatus])}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
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
