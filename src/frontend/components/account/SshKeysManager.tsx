"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { CustomerSshKeyDto } from "@/lib/types/sales";

interface FormErrors {
  label?: string;
  publicKey?: string;
}

// Đợt 3, Phần 12 - danh sách SSH Key lưu theo tài khoản (tái sử dụng qua nhiều đơn mua VPS khác nhau,
// mirror thông lệ Vultr/DigitalOcean). Không có Update - xoá key cũ + thêm key mới thay vì sửa.
export function SshKeysManager({ initialKeys }: { initialKeys: CustomerSshKeyDto[] }) {
  const router = useRouter();
  const [keys, setKeys] = useState(initialKeys);
  const [label, setLabel] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!label.trim()) nextErrors.label = "Vui lòng đặt tên gợi nhớ cho key";
    else if (label.length > 100) nextErrors.label = "Tên tối đa 100 ký tự";
    if (!publicKey.trim()) nextErrors.publicKey = "Vui lòng dán nội dung SSH Public Key";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer/ssh-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), publicKey: publicKey.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        setErrors((prev) => ({ ...prev, publicKey: data?.message ?? "Thêm SSH Key thất bại." }));
        return;
      }

      const created = (await res.json()) as CustomerSshKeyDto;
      setKeys((prev) => [created, ...prev]);
      setLabel("");
      setPublicKey("");
      toast.success("Đã thêm SSH Key");
      router.refresh();
    } catch {
      toast.error("Thêm SSH Key thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/customer/ssh-keys/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        toast.error(data?.message ?? "Xoá SSH Key thất bại.");
        return;
      }
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success("Đã xoá SSH Key");
      router.refresh();
    } catch {
      toast.error("Xoá SSH Key thất bại, vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-none border-border/50 overflow-hidden bg-card">
        <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
          <CardTitle className="text-xl font-bold">SSH Key</CardTitle>
          <CardDescription>
            Lưu SSH Public Key để chọn nhanh khi mua VPS mới, không cần dán lại mỗi lần đặt hàng.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bạn chưa lưu SSH Key nào.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {keys.map((key) => (
                <li
                  key={key.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{key.label}</p>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{key.publicKey}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Thêm ngày {formatDate(key.createdAt)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={deletingId === key.id}
                    onClick={() => handleDelete(key.id)}
                    aria-label={`Xoá SSH Key ${key.label}`}
                  >
                    <Trash className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none border-border/50 overflow-hidden bg-card">
        <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
          <CardTitle className="text-lg font-bold">Thêm SSH Key mới</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <FieldGroup className="max-w-xl gap-5">
              <Field>
                <Label htmlFor="ssh-key-label" className="text-[14px] font-medium">Tên gợi nhớ</Label>
                <Input
                  id="ssh-key-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="VD: Laptop cá nhân"
                  aria-invalid={!!errors.label}
                />
                <FieldError errors={errors.label ? [{ message: errors.label }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="ssh-key-public-key" className="text-[14px] font-medium">SSH Public Key</Label>
                <Textarea
                  id="ssh-key-public-key"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... ban@may-tinh"
                  rows={4}
                  className="font-mono text-xs"
                  aria-invalid={!!errors.publicKey}
                />
                <FieldError errors={errors.publicKey ? [{ message: errors.publicKey }] : undefined} />
              </Field>
            </FieldGroup>

            <div>
              <Button type="submit" disabled={isSubmitting} className="h-10 rounded-[8px] bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary-hover">
                <Plus className="size-4" />
                {isSubmitting ? "Đang lưu..." : "Thêm SSH Key"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
