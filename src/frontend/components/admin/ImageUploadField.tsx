"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageAction } from "@/app/admin/uploads/actions";
import { resolveImageUrl } from "@/lib/utils";

interface ImageUploadFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaInvalid?: boolean;
}

// Dùng chung cho mọi field ảnh trong Admin (ServiceCategoryDialog.iconUrl, NewsArticleForm.thumbnailUrl,
// TestimonialDialog.avatarUrl, PartnerDialog.logoUrl) - giữ nguyên ô nhập URL cũ (vẫn dán tay được như
// trước, không phá luồng cũ) + thêm nút chọn file, upload xong tự điền URL trả về từ backend
// (AdminUploadsController.cs) vào field.
export function ImageUploadField({ id, value, onChange, placeholder, ariaInvalid }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      onChange(result.data.url);
      toast.success("Đã tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" data-icon="inline-start" />
          {isUploading ? "Đang tải..." : "Tải ảnh lên"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolveImageUrl(value)} alt="Xem trước" className="size-16 rounded-lg border border-zinc-200 object-cover" />
      )}
    </div>
  );
}
