"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { submitAffiliateApplication } from "@/lib/api/sales";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PartnerFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

// Form đăng ký affiliate thật - gọi thẳng submitAffiliateApplication() (lib/api/sales.ts), KHÔNG qua
// Route Handler như RegisterForm/CommentForm vì sales.ts đã ghi rõ đây là 1 trong 3 form công khai được
// miễn CORS, gọi thẳng browser -> backend. Giới hạn ký tự mirror đúng cột DB
// (AffiliateApplicationConfiguration.cs: FullName/Email 100, Phone 20, WebsiteUrl 255, PromotionPlan 500).
// Thành công: toast + reset field tại chỗ (như CommentForm.tsx) - AffiliateApplicationDto trả về chỉ có
// id/status/createdAt, không có gì để hiển thị cá nhân hoá thêm nên không cần redirect.
export function PartnerApplicationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [promotionPlan, setPromotionPlan] = useState("");
  const [errors, setErrors] = useState<PartnerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: PartnerFormErrors = {};
    if (!fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên";
    } else if (fullName.trim().length > 100) {
      nextErrors.fullName = "Họ tên tối đa 100 ký tự";
    }
    if (!email.trim()) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!EMAIL_PATTERN.test(email) || email.length > 100) {
      nextErrors.email = "Email không đúng định dạng";
    }
    if (!phone.trim()) {
      nextErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (phone.trim().length > 20) {
      nextErrors.phone = "Số điện thoại tối đa 20 ký tự";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitAffiliateApplication({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        promotionPlan: promotionPlan.trim() || undefined,
      });

      toast.success("Đã gửi đăng ký, đội ngũ Cloudverse sẽ liên hệ sớm");
      setFullName("");
      setEmail("");
      setPhone("");
      setWebsiteUrl("");
      setPromotionPlan("");
      setErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi đăng ký thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-card rounded-3xl p-8 sm:p-10">
        <h2 className="font-heading mb-8 text-center text-2xl font-bold sm:text-3xl">Đăng Ký Làm Đối Tác</h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <Label htmlFor="partner-fullname">Họ và tên</Label>
              <Input
                id="partner-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                className="h-11"
              />
              <FieldError errors={errors.fullName ? [{ message: errors.fullName }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="partner-email">Email</Label>
              <Input
                id="partner-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@congty.vn"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className="h-11"
              />
              <FieldError errors={errors.email ? [{ message: errors.email }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="partner-phone">Số điện thoại</Label>
              <Input
                id="partner-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className="h-11"
              />
              <FieldError errors={errors.phone ? [{ message: errors.phone }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="partner-website">Website / Kênh truyền thông (không bắt buộc)</Label>
              <Input
                id="partner-website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="h-11"
              />
            </Field>

            <Field>
              <Label htmlFor="partner-plan">Kế hoạch quảng bá (không bắt buộc)</Label>
              <textarea
                id="partner-plan"
                value={promotionPlan}
                onChange={(e) => setPromotionPlan(e.target.value)}
                placeholder="Bạn dự định giới thiệu dịch vụ Cloudverse như thế nào?"
                rows={4}
                maxLength={500}
                className={cn(
                  "w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-[15px] transition-colors outline-none",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full text-base font-semibold"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đăng ký"}
          </Button>
        </form>
      </div>
    </section>
  );
}
