"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { slugify } from "@/lib/utils";
import { createContentPageAction, updateContentPageAction } from "@/app/admin/content-pages/actions";
import { toast } from "sonner";
import type { AdminContentPageDto } from "@/lib/types/admin";

interface ContentPageFormProps {
  mode: "create" | "edit";
  initialData?: AdminContentPageDto;
}

interface FormErrors {
  title?: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Không có API GetById cho Content Page (list phẳng) - trang [id]/edit/page.tsx đã tự fetch nguyên
// list rồi .find(id) trước khi truyền initialData xuống đây. AuthorId/PublishedAt đều server-derive,
// form không có field nào cho 2 giá trị đó (đã verify DTO không nhận).
export function ContentPageForm({ mode, initialData }: ContentPageFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [content, setContent] = useState(initialData?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription ?? "");
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề";
    else if (title.length > 250) nextErrors.title = "Tiêu đề tối đa 250 ký tự";
    if (!slug.trim()) nextErrors.slug = "Vui lòng nhập slug";
    else if (slug.length > 150) nextErrors.slug = "Slug tối đa 150 ký tự";
    if (!content.trim()) nextErrors.content = "Vui lòng nhập nội dung";
    if (metaTitle.length > 200) nextErrors.metaTitle = "Meta title tối đa 200 ký tự";
    if (metaDescription.length > 500) nextErrors.metaDescription = "Meta description tối đa 500 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        slug: slug.trim(),
        title: title.trim(),
        content,
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        isPublished,
        displayOrder,
      };

      const result =
        mode === "edit" && initialData
          ? await updateContentPageAction(initialData.id, dto)
          : await createContentPageAction(dto);

      if (!result.success) {
        if (result.message.includes("Slug")) setErrors((prev) => ({ ...prev, slug: result.message }));
        else toast.error(result.message);
        return;
      }

      toast.success(mode === "edit" ? "Đã cập nhật trang" : "Đã thêm trang mới");
      router.push("/admin/content-pages");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Thông tin cơ bản</h2>
        <FieldGroup className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="page-title">Tiêu đề</Label>
              <Input
                id="page-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                aria-invalid={!!errors.title}
              />
              <FieldError errors={errors.title ? [{ message: errors.title }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="page-slug">Slug</Label>
              <Input
                id="page-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                aria-invalid={!!errors.slug}
              />
              <FieldError errors={errors.slug ? [{ message: errors.slug }] : undefined} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="page-meta-title">Meta title (SEO)</Label>
              <Input
                id="page-meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Tuỳ chọn - mặc định dùng Tiêu đề"
                aria-invalid={!!errors.metaTitle}
              />
              <FieldError errors={errors.metaTitle ? [{ message: errors.metaTitle }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="page-display-order">Thứ tự hiển thị</Label>
              <Input
                id="page-display-order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </Field>
          </div>

          <Field>
            <Label htmlFor="page-meta-description">Meta description (SEO)</Label>
            <Textarea
              id="page-meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Tuỳ chọn - hiển thị trong kết quả tìm kiếm"
              aria-invalid={!!errors.metaDescription}
            />
            <FieldError errors={errors.metaDescription ? [{ message: errors.metaDescription }] : undefined} />
          </Field>

          <label
            htmlFor="page-published"
            className="flex w-fit cursor-pointer items-center gap-3 pt-2 text-sm font-medium text-zinc-700"
          >
            <div className="relative flex items-center">
              <input
                id="page-published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
              <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            Xuất bản trang
          </label>
        </FieldGroup>
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Nội dung</h2>
        <div className="mt-6">
          <MarkdownEditor id="page-content" value={content} onChange={setContent} />
          <FieldError
            className="mt-2"
            errors={errors.content ? [{ message: errors.content }] : undefined}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-6"
          onClick={() => router.push("/admin/content-pages")}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu trang"}
        </Button>
      </div>
    </form>
  );
}
