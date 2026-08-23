"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createPartnerAction, updatePartnerAction } from "@/app/admin/partners/actions";
import type { AdminPartnerDto } from "@/lib/types/admin";

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: AdminPartnerDto | null;
}

interface FormState {
  name: string;
  logoUrl: string;
  websiteUrl: string;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { name: "", logoUrl: "", websiteUrl: "", displayOrder: 0, isActive: true };

interface FormErrors {
  name?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export function PartnerDialog({ open, onOpenChange, partner }: PartnerDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (partner) {
        setForm({
          name: partner.name,
          logoUrl: partner.logoUrl,
          websiteUrl: partner.websiteUrl ?? "",
          displayOrder: partner.displayOrder,
          isActive: partner.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, partner]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên đối tác";
    else if (form.name.length > 150) nextErrors.name = "Tên tối đa 150 ký tự";
    if (!form.logoUrl.trim()) nextErrors.logoUrl = "Vui lòng nhập URL logo";
    else if (form.logoUrl.length > 500) nextErrors.logoUrl = "URL tối đa 500 ký tự";
    if (form.websiteUrl.length > 500) nextErrors.websiteUrl = "URL tối đa 500 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        name: form.name.trim(),
        logoUrl: form.logoUrl.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };

      const result = partner ? await updatePartnerAction(partner.id, dto) : await createPartnerAction(dto);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(partner ? "Đã cập nhật đối tác" : "Đã thêm đối tác mới");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{partner ? "Sửa đối tác" : "Thêm đối tác"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="partner-name">Tên đối tác</Label>
              <Input
                id="partner-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={errors.name ? [{ message: errors.name }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="partner-logo">URL logo</Label>
              <ImageUploadField
                id="partner-logo"
                value={form.logoUrl}
                onChange={(value) => setForm((prev) => ({ ...prev, logoUrl: value }))}
                placeholder="https://..."
                ariaInvalid={!!errors.logoUrl}
              />
              <FieldError errors={errors.logoUrl ? [{ message: errors.logoUrl }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="partner-website">Website</Label>
              <Input
                id="partner-website"
                value={form.websiteUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://... (tuỳ chọn)"
                aria-invalid={!!errors.websiteUrl}
              />
              <FieldError errors={errors.websiteUrl ? [{ message: errors.websiteUrl }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="partner-order">Thứ tự hiển thị</Label>
              <Input
                id="partner-order"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
              />
            </Field>

            <label
              htmlFor="partner-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="partner-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Đang hoạt động
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu đối tác"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
