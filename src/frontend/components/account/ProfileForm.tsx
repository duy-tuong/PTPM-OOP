"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { CustomerType } from "@/lib/types/enums";
import type { CustomerProfileDto } from "@/lib/types/customerAuth";

interface ProfileFormErrors {
  fullName?: string;
  phone?: string;
}

// PUT qua Route Handler app/api/customer-auth/me/route.ts (không gọi thẳng backend - token httpOnly
// không đọc được từ client). Email không cho sửa (đổi email cần luồng xác thực riêng, ngoài phạm vi).
export function ProfileForm({ profile }: { profile: CustomerProfileDto }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [customerType, setCustomerType] = useState(
    CustomerType[profile.customerType as keyof typeof CustomerType] ?? CustomerType.Individual,
  );
  const [companyName, setCompanyName] = useState(profile.companyName ?? "");
  const [taxCode, setTaxCode] = useState(profile.taxCode ?? "");
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <Input id="profile-email" value={profile.email} disabled className="h-11" />
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

        {customerType === CustomerType.Business && (
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

      <Button type="submit" disabled={isSubmitting} className="h-11 w-fit px-8 text-base font-semibold">
        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
