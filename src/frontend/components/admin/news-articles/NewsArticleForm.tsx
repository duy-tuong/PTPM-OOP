"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { slugify } from "@/lib/utils";
import { createNewsArticleAction, updateNewsArticleAction } from "@/app/admin/news-articles/actions";
import type { AdminNewsArticleDto, AdminNewsCategoryDto } from "@/lib/types/admin";

interface NewsArticleFormProps {
  mode: "create" | "edit";
  initialData?: AdminNewsArticleDto;
  categories: AdminNewsCategoryDto[];
}

interface FormErrors {
  newsCategoryId?: string;
  title?: string;
  slug?: string;
  content?: string;
  summary?: string;
  thumbnailUrl?: string;
}

function toDateInputValue(value: string): string {
  return value ? value.slice(0, 10) : "";
}

// Tag-chip input tự dựng (components/ui/ chưa có component nào cho việc này) - state
// tagNames: string[], gõ xong Enter/dấu phẩy để thêm, click X trên Badge để xoá. Backend tự
// trim/de-dupe không phân biệt hoa-thường khi resolve (xem AdminNewsArticleService.ResolveTagsAsync)
// nên chỉ cần chặn trùng thô ở đây cho UX gọn, không cần chuẩn hoá kỹ.
export function NewsArticleForm({ mode, initialData, categories }: NewsArticleFormProps) {
  const router = useRouter();

  const [newsCategoryId, setNewsCategoryId] = useState(initialData?.newsCategoryId ?? categories[0]?.id ?? 0);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData);
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? true);
  const [publishedAt, setPublishedAt] = useState(initialData ? toDateInputValue(initialData.publishedAt) : "");
  const [tagNames, setTagNames] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setTagNames((prev) => (prev.some((tag) => tag.toLowerCase() === trimmed.toLowerCase()) ? prev : [...prev, trimmed]));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTagNames((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!newsCategoryId) nextErrors.newsCategoryId = "Vui lòng chọn danh mục";
    if (!title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề";
    else if (title.length > 250) nextErrors.title = "Tiêu đề tối đa 250 ký tự";
    if (!slug.trim()) nextErrors.slug = "Vui lòng nhập slug";
    else if (slug.length > 270) nextErrors.slug = "Slug tối đa 270 ký tự";
    if (!content.trim()) nextErrors.content = "Vui lòng nhập nội dung";
    if (summary.length > 500) nextErrors.summary = "Tóm tắt tối đa 500 ký tự";
    if (thumbnailUrl.length > 500) nextErrors.thumbnailUrl = "URL tối đa 500 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        newsCategoryId,
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || undefined,
        content,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        isPublished,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        tagNames,
      };

      const result =
        mode === "edit" && initialData
          ? await updateNewsArticleAction(initialData.id, dto)
          : await createNewsArticleAction(dto);

      if (!result.success) {
        if (result.message.includes("Slug")) setErrors((prev) => ({ ...prev, slug: result.message }));
        else toast.error(result.message);
        return;
      }

      toast.success(mode === "edit" ? "Đã cập nhật bài viết" : "Đã thêm bài viết mới");
      router.push("/admin/news-articles");
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
              <Label htmlFor="article-category">Danh mục</Label>
              <Select
                items={categories.map((category) => ({ value: String(category.id), label: category.name }))}
                value={String(newsCategoryId)}
                onValueChange={(value) => setNewsCategoryId(Number(value))}
              >
                <SelectTrigger id="article-category" className="w-full">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={errors.newsCategoryId ? [{ message: errors.newsCategoryId }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="article-published-at">Ngày đăng</Label>
              <Input
                id="article-published-at"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
              {!publishedAt && <FieldDescription>Để trống - hệ thống tự lấy ngày hiện tại khi lưu</FieldDescription>}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="article-title">Tiêu đề</Label>
              <Input
                id="article-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                aria-invalid={!!errors.title}
              />
              <FieldError errors={errors.title ? [{ message: errors.title }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="article-slug">Slug</Label>
              <Input
                id="article-slug"
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

          <Field>
            <Label htmlFor="article-summary">Tóm tắt</Label>
            <Input
              id="article-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Hiển thị ở danh sách tin tức, tối đa 500 ký tự"
              aria-invalid={!!errors.summary}
            />
            <FieldError errors={errors.summary ? [{ message: errors.summary }] : undefined} />
          </Field>

          <Field>
            <Label htmlFor="article-thumbnail">URL ảnh đại diện</Label>
            <ImageUploadField
              id="article-thumbnail"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              placeholder="https://..."
              ariaInvalid={!!errors.thumbnailUrl}
            />
            <FieldError errors={errors.thumbnailUrl ? [{ message: errors.thumbnailUrl }] : undefined} />
          </Field>

          <Field>
            <Label htmlFor="article-tag-input">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="article-tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Gõ tên tag rồi nhấn Enter"
              />
              <Button type="button" variant="outline" size="sm" className="shrink-0 border-dashed" onClick={addTag}>
                <Plus className="size-4" data-icon="inline-start" />
                Thêm
              </Button>
            </div>
            {tagNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagNames.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Xoá tag ${tag}`}
                      className="rounded-full p-0.5 hover:bg-zinc-300/60"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Field>

          <label
            htmlFor="article-published"
            className="flex w-fit cursor-pointer items-center gap-3 pt-2 text-sm font-medium text-zinc-700"
          >
            <div className="relative flex items-center">
              <input
                id="article-published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
              <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            Xuất bản bài viết
          </label>
        </FieldGroup>
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Nội dung</h2>
        <div className="mt-6">
          <MarkdownEditor id="article-content" value={content} onChange={setContent} />
          <FieldError className="mt-2" errors={errors.content ? [{ message: errors.content }] : undefined} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-6"
          onClick={() => router.push("/admin/news-articles")}
        >
          Huỷ
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu bài viết"}
        </Button>
      </div>
    </form>
  );
}
