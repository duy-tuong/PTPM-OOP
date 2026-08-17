"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFaqAction, updateFaqAction } from "@/app/admin/faqs/actions";
import type { AdminFaqDto, AdminServiceCategoryDto } from "@/lib/types/admin";

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: AdminFaqDto | null;
  categories: AdminServiceCategoryDto[];
}

interface FormState {
  question: string;
  answer: string;
  serviceCategoryId: number | null;
  displayOrder: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = { question: "", answer: "", serviceCategoryId: null, displayOrder: 0, isActive: true };

interface FormErrors {
  question?: string;
  answer?: string;
}

const ALL_CATEGORIES_VALUE = "all";

// unpaged-list-in-Dialog - Answer dùng Textarea thường (không MarkdownEditor, field ngắn trong
// Dialog nhỏ, khác Content Page/News Article Content).
export function FaqDialog({ open, onOpenChange, faq, categories }: FaqDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (faq) {
        setForm({
          question: faq.question,
          answer: faq.answer,
          serviceCategoryId: faq.serviceCategoryId ?? null,
          displayOrder: faq.displayOrder,
          isActive: faq.isActive,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, faq]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.question.trim()) nextErrors.question = "Vui lòng nhập câu hỏi";
    else if (form.question.length > 500) nextErrors.question = "Câu hỏi tối đa 500 ký tự";
    if (!form.answer.trim()) nextErrors.answer = "Vui lòng nhập câu trả lời";
    else if (form.answer.length > 2000) nextErrors.answer = "Câu trả lời tối đa 2000 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        serviceCategoryId: form.serviceCategoryId ?? undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };

      const result = faq ? await updateFaqAction(faq.id, dto) : await createFaqAction(dto);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(faq ? "Đã cập nhật câu hỏi" : "Đã thêm câu hỏi mới");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[24px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{faq ? "Sửa câu hỏi" : "Thêm câu hỏi"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="faq-question">Câu hỏi</Label>
              <Textarea
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                aria-invalid={!!errors.question}
              />
              <FieldError errors={errors.question ? [{ message: errors.question }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="faq-answer">Câu trả lời</Label>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))}
                rows={5}
                aria-invalid={!!errors.answer}
              />
              <FieldError errors={errors.answer ? [{ message: errors.answer }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="faq-category">Áp dụng cho danh mục</Label>
              <Select
                value={form.serviceCategoryId ? String(form.serviceCategoryId) : ALL_CATEGORIES_VALUE}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceCategoryId: value === ALL_CATEGORIES_VALUE ? null : Number(value),
                  }))
                }
              >
                <SelectTrigger id="faq-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES_VALUE}>Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="faq-order">Thứ tự hiển thị</Label>
              <Input
                id="faq-order"
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))}
              />
            </Field>

            <label
              htmlFor="faq-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="faq-active"
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
              {isSubmitting ? "Đang lưu..." : "Lưu câu hỏi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
