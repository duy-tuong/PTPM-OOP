"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerTypeToggle } from "@/components/contact/CustomerTypeToggle";
import { CustomerType } from "@/lib/types/enums";
import { cn } from "@/lib/utils";
import { submitConsultationRequest } from "@/lib/api/sales";
import type { ServiceCategoryDto } from "@/lib/types/catalog";

interface ConsultationFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Field theo đúng CreateConsultationRequestDto (tên 150/email 100/phone 20/subject 200/message 2000).
export function ConsultationRequestForm({ categories }: { categories: ServiceCategoryDto[] }) {
  const [customerType, setCustomerType] = useState(CustomerType.Individual);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ConsultationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: ConsultationFormErrors = {};
    if (!fullName.trim() || fullName.trim().length > 150) {
      nextErrors.fullName = "Vui lòng nhập họ tên (tối đa 150 ký tự)";
    }
    if (!email.trim() || !EMAIL_PATTERN.test(email) || email.length > 100) {
      nextErrors.email = "Email không hợp lệ";
    }
    if (!phone.trim() || phone.trim().length > 20) {
      nextErrors.phone = "Vui lòng nhập số điện thoại (tối đa 20 ký tự)";
    }
    if (!subject.trim() || subject.trim().length > 200) {
      nextErrors.subject = "Vui lòng nhập tiêu đề (tối đa 200 ký tự)";
    }
    if (!message.trim() || message.trim().length > 2000) {
      nextErrors.message = "Vui lòng nhập nội dung (tối đa 2000 ký tự)";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitConsultationRequest({
        customerType,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companyName: customerType === CustomerType.Business ? companyName.trim() || undefined : undefined,
        serviceCategoryId: serviceCategoryId ?? undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success("Đã gửi yêu cầu tư vấn, đội ngũ Cloudverse sẽ liên hệ sớm");
      setFullName("");
      setEmail("");
      setPhone("");
      setCompanyName("");
      setServiceCategoryId(null);
      setSubject("");
      setMessage("");
      setErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <CustomerTypeToggle value={customerType} onChange={setCustomerType} />

      <FieldGroup>
        {categories.length > 0 && (
          <Field>
            <Label htmlFor="consult-category">Dịch vụ quan tâm (không bắt buộc)</Label>
            <Select
              items={categories.map((category) => ({ value: String(category.id), label: category.name }))}
              value={serviceCategoryId ? String(serviceCategoryId) : null}
              onValueChange={(value) => setServiceCategoryId(value ? Number(value) : null)}
            >
              <SelectTrigger id="consult-category" className="w-full">
                <SelectValue placeholder="Chọn danh mục dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field>
          <Label htmlFor="consult-name">Họ và tên</Label>
          <Input
            id="consult-name"
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
          <Label htmlFor="consult-email">Email</Label>
          <Input
            id="consult-email"
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
          <Label htmlFor="consult-phone">Số điện thoại</Label>
          <Input
            id="consult-phone"
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

        {customerType === CustomerType.Business && (
          <Field>
            <Label htmlFor="consult-company">Tên công ty</Label>
            <Input
              id="consult-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-11"
            />
          </Field>
        )}

        <Field>
          <Label htmlFor="consult-subject">Tiêu đề</Label>
          <Input
            id="consult-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Tôi cần tư vấn về..."
            aria-invalid={!!errors.subject}
            className="h-11"
          />
          <FieldError errors={errors.subject ? [{ message: errors.subject }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="consult-message">Nội dung</Label>
          <textarea
            id="consult-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={2000}
            aria-invalid={!!errors.message}
            className={cn(
              "w-full min-w-0 rounded-xl border border-input bg-transparent px-3 py-2 text-[15px] transition-colors outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
          <FieldError errors={errors.message ? [{ message: errors.message }] : undefined} />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-11 w-full text-base font-semibold">
        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
      </Button>
    </form>
  );
}
