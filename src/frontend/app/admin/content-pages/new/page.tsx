import type { Metadata } from "next";
import { ContentPageForm } from "@/components/admin/content-pages/ContentPageForm";

export const metadata: Metadata = {
  title: "Thêm trang nội dung",
};

export default function AdminNewContentPagePage() {
  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Thêm trang nội dung</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Tạo trang tĩnh mới (vd Giới thiệu, Điều khoản...).</p>
        </div>
        <ContentPageForm mode="create" />
      </div>
    </div>
  );
}
