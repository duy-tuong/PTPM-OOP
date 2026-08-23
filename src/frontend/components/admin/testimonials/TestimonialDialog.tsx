"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { createTestimonialAction, updateTestimonialAction } from "@/app/admin/testimonials/actions";
import type { AdminTestimonialDto } from "@/lib/types/admin";

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: AdminTestimonialDto | null;
}

interface FormState {
  displayName: string;
  companyName: string;
  avatarUrl: string;
  content: string;
  rating: string;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  displayName: "",
  companyName: "",
  avatarUrl: "",
  content: "",
  rating: "",
  displayOrder: 0,
  isActive: true,
};

interface FormErrors {
  displayName?: string;
  content?: string;
  companyName?: string;
  avatarUrl?: string;
  rating?: string;
}

export function TestimonialDialog({ open, onOpenChange, testimonial }: TestimonialDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (testimonial) {
        setForm({
          displayName: testimonial.displayName,
          companyName: testimonial.companyName ?? "",
          avatarUrl: testimonial.avatarUrl ?? "",
          content: testimonial.content,
          rating: testimonial.rating ? String(testimonial.rating) : "",
          displayOrder: testimonial.displayOrder,
          isActive: testimonial.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, testimonial]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.displayName.trim()) nextErrors.displayName = "Vui lòng nhập tên người đánh giá";
    else if (form.displayName.length > 100) nextErrors.displayName = "Tên tối đa 100 ký tự";
    if (!form.content.trim()) nextErrors.content = "Vui lòng nhập nội dung đánh giá";
    else if (form.content.length > 1000) nextErrors.content = "Nội dung tối đa 1000 ký tự";
    if (form.companyName.length > 150) nextErrors.companyName = "Tối đa 150 ký tự";
    if (form.avatarUrl.length > 500) nextErrors.avatarUrl = "URL tối đa 500 ký tự";
    if (form.rating) {
      const ratingValue = Number(form.rating);
      if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        nextErrors.rating = "Số sao phải từ 1 đến 5";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        displayName: form.displayName.trim(),
        companyName: form.companyName.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
        content: form.content.trim(),
        rating: form.rating ? Number(form.rating) : undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };

      const result = testimonial
        ? await updateTestimonialAction(testimonial.id, dto)
        : await createTestimonialAction(dto);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(testimonial ? "Đã cập nhật đánh giá" : "Đã thêm đánh giá mới");
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
            <DialogTitle>{testimonial ? "Sửa đánh giá" : "Thêm đánh giá"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="testimonial-display-name">Tên người đánh giá</Label>
              <Input
                id="testimonial-display-name"
                value={form.displayName}
                onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                aria-invalid={!!errors.displayName}
              />
              <FieldError errors={errors.displayName ? [{ message: errors.displayName }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="testimonial-company">Công ty</Label>
              <Input
                id="testimonial-company"
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Tuỳ chọn"
                aria-invalid={!!errors.companyName}
              />
              <FieldError errors={errors.companyName ? [{ message: errors.companyName }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="testimonial-avatar">URL ảnh đại diện</Label>
              <ImageUploadField
                id="testimonial-avatar"
                value={form.avatarUrl}
                onChange={(value) => setForm((prev) => ({ ...prev, avatarUrl: value }))}
                placeholder="https://..."
                ariaInvalid={!!errors.avatarUrl}
              />
              <FieldError errors={errors.avatarUrl ? [{ message: errors.avatarUrl }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="testimonial-content">Nội dung đánh giá</Label>
              <Textarea
                id="testimonial-content"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={4}
                aria-invalid={!!errors.content}
              />
              <FieldError errors={errors.content ? [{ message: errors.content }] : undefined} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="testimonial-rating">Số sao (1-5)</Label>
                <Input
                  id="testimonial-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
                  placeholder="Tuỳ chọn"
                  aria-invalid={!!errors.rating}
                />
                <FieldError errors={errors.rating ? [{ message: errors.rating }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="testimonial-order">Thứ tự hiển thị</Label>
                <Input
                  id="testimonial-order"
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
                />
              </Field>
            </div>

            <label
              htmlFor="testimonial-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="testimonial-active"
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
              {isSubmitting ? "Đang lưu..." : "Lưu đánh giá"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
