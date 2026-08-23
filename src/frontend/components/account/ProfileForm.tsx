"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { CustomerType } from "@/lib/types/enums";
import { formatDate, cn } from "@/lib/utils";
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

  const isDirty =
    fullName.trim() !== (profile.fullName ?? "") ||
    phone.trim() !== (profile.phone ?? "") ||
    customerType !== (CustomerType[profile.customerType as keyof typeof CustomerType] ?? CustomerType.Individual) ||
    companyName.trim() !== (profile.companyName ?? "") ||
    taxCode.trim() !== (profile.taxCode ?? "");

  const showBusinessFields = customerType === CustomerType.Business || !!companyName || !!taxCode;

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
    if (!isDirty) return;
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

      toast.success("Đã cập nhật hồ sơ thành công");
      // Update local profile props artificially so isDirty becomes false? 
      // Actually we should let the parent re-fetch, or we can just keep it. Next.js router.refresh() would be ideal.
      window.location.reload(); 
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cập nhật hồ sơ thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    setFullName(profile.fullName ?? "");
    setPhone(profile.phone ?? "");
    setCustomerType(CustomerType[profile.customerType as keyof typeof CustomerType] ?? CustomerType.Individual);
    setCompanyName(profile.companyName ?? "");
    setTaxCode(profile.taxCode ?? "");
    setErrors({});
  }

  return (
    <Card className="shadow-none border-border/50 overflow-hidden bg-card">
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
        <CardTitle className="text-xl font-bold">Hồ sơ cá nhân</CardTitle>
        <CardDescription>Cập nhật thông tin liên hệ và loại hình tài khoản của bạn</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          
          {/* Section 1: Thông tin tài khoản */}
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-foreground">Thông tin tài khoản</h3>
            <p className="text-[13px] text-muted-foreground mt-1 mb-5">Xác định tư cách pháp nhân để xuất hoá đơn.</p>
            
            <div className="max-w-md">
              <CustomerTypeToggle value={customerType} onChange={setCustomerType} />
            </div>
          </div>

          <div className="h-px w-full bg-border/40 mb-8" />

          {/* Section 2: Thông tin liên hệ */}
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-foreground">Thông tin liên hệ</h3>
            <p className="text-[13px] text-muted-foreground mt-1 mb-5">Thông tin được sử dụng để liên hệ và gửi thông báo.</p>
            
            <FieldGroup className="max-w-xl space-y-5">
              <Field>
                <Label htmlFor="profile-fullname" className="text-[14px] font-medium">Họ và tên</Label>
                <Input
                  id="profile-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={!!errors.fullName}
                  className="h-11 rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                />
                <FieldError errors={errors.fullName ? [{ message: errors.fullName }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="profile-email" className="text-[14px] font-medium flex items-center justify-between">
                  Email
                  {profile.isEmailVerified ? (
                    <span className="text-indigo-600 dark:text-indigo-500 text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Đã xác thực
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-500 text-xs flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Chưa xác thực
                    </span>
                  )}
                </Label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-3">
                    <Input 
                      id="profile-email" 
                      value={profile.email} 
                      disabled 
                      className="h-11 rounded-[8px] bg-muted/40 text-muted-foreground border-border/60" 
                    />
                    {!showEmailForm && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowEmailForm(true)}
                        className="h-11 px-4 rounded-[8px] shrink-0 text-[13px]"
                      >
                        Đổi email
                      </Button>
                    )}
                  </div>
                  {!profile.isEmailVerified && !showEmailForm && (
                    <button type="button" className="text-left text-sm text-indigo-600 hover:underline">
                      Gửi lại email xác thực
                    </button>
                  )}
                </div>
                {showEmailForm && (
                  <div className="flex flex-col gap-2 rounded-xl border border-border/60 p-4 mt-2 bg-muted/20">
                    <Label htmlFor="profile-new-email" className="text-[13px]">Email mới</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profile-new-email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email-moi@congty.vn"
                        aria-invalid={!!emailError}
                        className="h-10 border-border/60 bg-background rounded-[8px]"
                      />
                      <Button type="button" size="sm" disabled={isChangingEmail} onClick={handleChangeEmail} className="rounded-[8px] bg-indigo-600 hover:bg-indigo-700">
                        {isChangingEmail ? "Đang gửi..." : "Gửi yêu cầu"}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setShowEmailForm(false)} className="rounded-[8px]">
                        Huỷ
                      </Button>
                    </div>
                    <FieldError errors={emailError ? [{ message: emailError }] : undefined} />
                  </div>
                )}
              </Field>

              <Field>
                <Label htmlFor="profile-phone" className="text-[14px] font-medium">Số điện thoại</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!errors.phone}
                  className="h-11 rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                />
                <FieldError errors={errors.phone ? [{ message: errors.phone }] : undefined} />
              </Field>
            </FieldGroup>
          </div>

          {/* Section 3: Thông tin doanh nghiệp */}
          {showBusinessFields && (
            <>
              <div className="h-px w-full bg-border/40 mb-8" />
              <div className="mb-8">
                <h3 className="text-[16px] font-semibold text-foreground">Thông tin doanh nghiệp</h3>
                <p className="text-[13px] text-muted-foreground mt-1 mb-5">Thông tin pháp lý của doanh nghiệp.</p>
                
                <FieldGroup className="max-w-xl space-y-5">
                  <Field>
                    <Label htmlFor="profile-company" className="text-[14px] font-medium">Tên công ty</Label>
                    <Input
                      id="profile-company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-11 rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="profile-taxcode" className="text-[14px] font-medium">Mã số thuế</Label>
                    <Input
                      id="profile-taxcode"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      className="h-11 rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                    />
                  </Field>
                </FieldGroup>
              </div>
            </>
          )}

          {/* Form Footer */}
          <div className="border-t border-border/40 pt-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-muted-foreground">
              Cập nhật lần cuối: {profile.updatedAt ? formatDate(profile.updatedAt) : formatDate(profile.createdAt)}
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isDirty && (
                <div className="text-[13px] text-amber-600 font-medium mr-2 hidden sm:block">
                  ● Bạn có thay đổi chưa được lưu
                </div>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={!isDirty || isSubmitting}
                className="h-11 px-6 rounded-[8px] font-medium flex-1 sm:flex-none border-border/60"
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={!isDirty || isSubmitting} 
                className={cn(
                  "h-11 px-6 rounded-[8px] font-semibold transition-all flex-1 sm:flex-none",
                  isDirty ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-muted text-muted-foreground shadow-none"
                )}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
