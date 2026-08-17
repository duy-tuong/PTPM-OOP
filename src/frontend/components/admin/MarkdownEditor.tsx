"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

// @uiw/react-md-editor thao tác trực tiếp DOM (textarea/selection APIs) - không tương thích SSR,
// bắt buộc dynamic import với ssr:false (đúng lý do plan gốc nêu).
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

// Dùng chung cho Content Page/News Article Content (Phase 6.8) - ép cứng light mode vì Admin luôn
// light mode (đã chốt từ Phase 6.5), không phụ thuộc theme hệ thống của trình duyệt user.
export function MarkdownEditor({ id, value, onChange }: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor id={id} value={value} onChange={(next) => onChange(next ?? "")} height={320} preview="live" />
    </div>
  );
}
