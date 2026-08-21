import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { getAdminContentPages } from "@/lib/api/admin/content-pages";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { Button } from "@/components/ui/button";
import { ContentPagesTable } from "@/components/admin/content-pages/ContentPagesTable";

export const metadata: Metadata = {
  title: "Quản lý trang nội dung",
};

export default async function AdminContentPagesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const pages = await getAdminContentPages(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Trang nội dung</h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Quản lý các trang tĩnh như Giới thiệu, Điều khoản, Chính sách...
            </p>
          </div>
          <Button
            className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
            nativeButton={false}
            render={
              <Link href="/admin/content-pages/new">
                <Plus className="size-4" data-icon="inline-start" />
                Thêm trang
              </Link>
            }
          />
        </div>

        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
          <ContentPagesTable pages={pages} />
        </div>
      </div>
    </div>
  );
}
