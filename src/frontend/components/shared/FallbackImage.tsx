"use client";

import { useState } from "react";
import type { ReactNode } from "react";

// Nhiều field ảnh trong dữ liệu seed (Phase 3.0: Partner.logoUrl, Testimonial.avatarUrl,
// NewsArticle.thumbnailUrl...) là URL placeholder giả (domain cloudservicestore.local không tồn
// tại), không load được. Component leaf 'use client' này bắt lỗi tải ảnh và thay bằng badge chữ
// cái đầu - tránh vỡ ảnh mà không cần icon người/avatar generic (đúng tinh thần §9.D của skill).
// `fallback` (tuỳ chọn) cho phép nơi gọi thay hẳn badge mặc định bằng UI riêng (vd icon khổng lồ ở
// ServicesZigzagList) - không truyền thì giữ nguyên hành vi badge chữ cái như trước.
export function FallbackImage({
  src,
  alt,
  className,
  fallbackClassName,
  fallback,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <span
        role="img"
        aria-label={alt}
        className={
          fallbackClassName ??
          "flex items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground"
        }
      >
        {alt.trim().slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
