"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { CustomerType } from "@/lib/types/enums";
import { formatDate } from "@/lib/utils";
import type { CustomerProfileDto } from "@/lib/types/customerAuth";

interface ProfileFormErrors {
  fullName?: string;
  phone?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUT qua Route Handler app/api/customer-auth/me/route.ts (không gọi thẳng backend - token httpOnly
// không đọc được từ client). Email hiển thị read-only ở field chính - đổi email đi qua khối riêng bên
// dưới (yêu cầu xác thực email mới trước khi thật sự đổi, xem app/(public)/xac-thuc-email/page.tsx).
export function ProfileForm({ profile }: { profile: CustomerProfileDto }) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [customerType, setCustomerType] = useState(
    CustomerType[profile.customerType as keyof typeof CustomerType] ?? CustomerType.Individual,
  );
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [taxCode, setTaxCode] = useState(profile.taxCode ?? "");
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // customerType hiện tại có thể là Individual dù companyName/taxCode đã có sẵn giá trị (vd dữ liệu cũ) -
  // vẫn hiện field để không mất dữ liệu khỏi tầm mắt người dùng, thay vì chỉ dựa vào customerType===Business.
  const showBusinessFields = customerType === CustomerType.Business || !!companyName || !!taxCode;

  // Không lồng <form> thứ 2 bên trong form chính (invalid HTML) - nút "Gửi yêu cầu" gọi thẳng hàm này
  // qua onClick thay vì onSubmit.
  async function handleChangeEmail() {
    if (!newEmail.trim() || !EMAIL_PATTERN.test(newEmail)) {
      setEmailError("Email không đúng định dạng");
      return;
    }
    setEmailError(undefined);

    setIsChangingEmail(true);
    try {
      const res = await fetch("/api/customer-auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Gửi yêu cầu đổi email thất bại, vui lòng thử lại.");
      }

      toast.success(`Đã gửi email xác thực tới ${newEmail.trim()}, vui lòng kiểm tra hộp thư`);
      setShowEmailForm(false);
      setNewEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi yêu cầu đổi email thất bại, vui lòng thử lại.");
    } finally {
      setIsChangingEmail(false);
    }
  }

  function validate(): boolean {
    const nextErrors: ProfileFormErrors = {};
    if (!fullName.trim() || fullName.trim().length > 100) {
      nextErrors.fullName = "Vui lòng nhập họ tên (tối đa 100 ký tự)";
    }
    if (!phone.trim() || phone.trim().length > 20) {
      nextErrors.phone = "Vui lòng nhập số điện thoại (tối đa 20 ký tự)";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer-auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          customerType,
          companyName: customerType === CustomerType.Business ? companyName.trim() || undefined : undefined,
          taxCode: customerType === CustomerType.Business ? taxCode.trim() || undefined : undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Cập nhật hồ sơ thất bại, vui lòng thử lại.");
      }

      toast.success("Đã cập nhật hồ sơ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cập nhật hồ sơ thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-lg flex-col gap-6">
      <CustomerTypeToggle value={customerType} onChange={setCustomerType} />

      <FieldGroup>
        <Field>
          <Label htmlFor="profile-email">Email</Label>
          <div className="flex items-center gap-2">
            <Input id="profile-email" value={profile.email} disabled className="h-11" />
            <Badge variant={profile.isEmailVerified ? "secondary" : "outline"} className="shrink-0">
              {profile.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
            </Badge>
          </div>
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-fit text-sm text-primary hover:underline"
            >
              Đổi email
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-xl border border-border p-3">
              <Label htmlFor="profile-new-email">Email mới</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="profile-new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email-moi@congty.vn"
                  aria-invalid={!!emailError}
                  className="h-10"
                />
                <Button type="button" size="sm" disabled={isChangingEmail} onClick={handleChangeEmail}>
                  {isChangingEmail ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowEmailForm(false)}>
                  Huỷ
                </Button>
              </div>
              <FieldError errors={emailError ? [{ message: emailError }] : undefined} />
            </div>
          )}
        </Field>

        <Field>
          <Label htmlFor="profile-fullname">Họ và tên</Label>
          <Input
            id="profile-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!errors.fullName}
            className="h-11"
          />
          <FieldError errors={errors.fullName ? [{ message: errors.fullName }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="profile-phone">Số điện thoại</Label>
          <Input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
            className="h-11"
          />
          <FieldError errors={errors.phone ? [{ message: errors.phone }] : undefined} />
        </Field>

        {showBusinessFields && (
          <>
            <Field>
              <Label htmlFor="profile-company">Tên công ty</Label>
              <Input
                id="profile-company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11"
              />
            </Field>
            <Field>
              <Label htmlFor="profile-taxcode">Mã số thuế</Label>
              <Input
                id="profile-taxcode"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                className="h-11"
              />
            </Field>
          </>
        )}
      </FieldGroup>

      <p className="text-sm text-muted-foreground">
        Thành viên từ {formatDate(profile.createdAt)}
        {profile.updatedAt && <> · Cập nhật lần cuối {formatDate(profile.updatedAt)}</>}
      </p>

      <Button type="submit" disabled={isSubmitting} className="h-11 w-fit px-8 text-base font-semibold">
        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
