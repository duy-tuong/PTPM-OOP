"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAffiliateApplicationStatusAction } from "@/app/admin/affiliate-applications/actions";
import { AffiliateApplicationStatus, AFFILIATE_APPLICATION_STATUS_LABELS } from "@/lib/types/enums";
import type { AdminAffiliateApplicationDto } from "@/lib/types/admin";

interface AffiliateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: AdminAffiliateApplicationDto | null;
}

// Backend luôn ghi đè ReviewedByUserId/ReviewedAt = người/lúc thao tác gần nhất mỗi lần PUT (không
// phải chỉ set 1 lần) - đúng ý nghĩa "lần duyệt gần nhất", không cần hiển thị cảnh báo gì thêm.
export function AffiliateStatusDialog({ open, onOpenChange, application }: AffiliateStatusDialogProps) {
  const router = useRouter();
  const [newStatus, setNewStatus] = useState<AffiliateApplicationStatus>(AffiliateApplicationStatus.Pending);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewNoteError, setReviewNoteError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (open && application) {
        setNewStatus(
          AffiliateApplicationStatus[application.status as keyof typeof AffiliateApplicationStatus] ??
            AffiliateApplicationStatus.Pending,
        );
        setReviewNote(application.reviewNote ?? "");
      }
      setReviewNoteError(undefined);
    }
    syncForm();
  }, [open, application]);

  async function handleSubmit() {
    if (!application) return;

    if (reviewNote.length > 1000) {
      setReviewNoteError("Ghi chú tối đa 1000 ký tự");
      return;
    }
    setReviewNoteError(undefined);

    setIsSubmitting(true);
    try {
      const result = await updateAffiliateApplicationStatusAction(application.id, {
        newStatus,
        reviewNote: reviewNote.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Đã cập nhật trạng thái đăng ký affiliate");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Duyệt đăng ký affiliate</DialogTitle>
        </DialogHeader>

        <FieldGroup className="py-4">
          <div className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Người đăng ký</span>
              <span className="font-medium text-zinc-900">{application.fullName}</span>
            </div>
            <div className="mt-1 flex justify-between gap-4">
              <span className="text-zinc-500">Email</span>
              <span className="font-medium text-zinc-900">{application.email}</span>
            </div>
            {application.websiteUrl && (
              <div className="mt-1 flex justify-between gap-4">
                <span className="text-zinc-500">Website</span>
                <span className="max-w-[60%] truncate font-medium text-zinc-900">{application.websiteUrl}</span>
              </div>
            )}
          </div>

          <Field>
            <Label htmlFor="affiliate-new-status">Trạng thái mới</Label>
            <Select
              value={String(newStatus)}
              onValueChange={(value) => setNewStatus(Number(value) as AffiliateApplicationStatus)}
            >
              <SelectTrigger id="affiliate-new-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AFFILIATE_APPLICATION_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem
                    key={key}
                    value={String(AffiliateApplicationStatus[key as keyof typeof AffiliateApplicationStatus])}
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label htmlFor="affiliate-review-note">Ghi chú duyệt</Label>
            <Textarea
              id="affiliate-review-note"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Tuỳ chọn - lý do duyệt/từ chối"
              rows={3}
              aria-invalid={!!reviewNoteError}
            />
            <FieldError errors={reviewNoteError ? [{ message: reviewNoteError }] : undefined} />
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
