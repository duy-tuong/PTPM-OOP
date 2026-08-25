"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCustomerAction } from "@/app/admin/customers/actions";
import type { AdminCustomerDto, AdminUserDto } from "@/lib/types/admin";

const NO_SALES_REP_VALUE = "none";

interface CustomerDetailFormProps {
  customer: AdminCustomerDto;
  // Danh sách nhân viên (Admin/Editor) làm nguồn gán Sales phụ trách - không lọc theo role, bất kỳ
  // nhân viên nào cũng gán được (đúng tinh thần "phụ trách chăm sóc", không phải phân quyền truy cập).
  salesReps: AdminUserDto[];
}

// CRM: Hồ sơ B2B & Sales Rep (Đợt 2, Phần 10) - 5 field đều tuỳ chọn, CreditLimit chỉ mang tính tham
// khảo cho Sales (không có logic enforce), ghi rõ trong placeholder để tránh Admin hiểu nhầm là hạn mức
// công nợ thật (hệ thống 100% trả trước qua PayOS).
export function CustomerDetailForm({ customer, salesReps }: CustomerDetailFormProps) {
  const router = useRouter();

  const [billingAddress, setBillingAddress] = useState(customer.billingAddress ?? "");
  const [legalRepresentativeName, setLegalRepresentativeName] = useState(customer.legalRepresentativeName ?? "");
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(customer.businessLicenseNumber ?? "");
  const [creditLimit, setCreditLimit] = useState(customer.creditLimit?.toString() ?? "");
  const [assignedSalesRepUserId, setAssignedSalesRepUserId] = useState(customer.assignedSalesRepUserId ?? NO_SALES_REP_VALUE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      const result = await updateCustomerAction(customer.id, {
        billingAddress: billingAddress.trim() || null,
        legalRepresentativeName: legalRepresentativeName.trim() || null,
        businessLicenseNumber: businessLicenseNumber.trim() || null,
        creditLimit: creditLimit.trim() ? Number(creditLimit) : null,
        assignedSalesRepUserId: assignedSalesRepUserId === NO_SALES_REP_VALUE ? null : assignedSalesRepUserId,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success("Đã cập nhật hồ sơ khách hàng");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Hồ sơ B2B</h2>
        <p className="mt-1 text-sm text-zinc-500">Thông tin bổ sung cho khách hàng doanh nghiệp - tất cả đều tuỳ chọn.</p>
        <FieldGroup className="mt-6">
          <Field>
            <Label htmlFor="customer-billing-address">Địa chỉ xuất hoá đơn</Label>
            <Input
              id="customer-billing-address"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="customer-legal-rep">Người đại diện pháp luật</Label>
              <Input
                id="customer-legal-rep"
                value={legalRepresentativeName}
                onChange={(e) => setLegalRepresentativeName(e.target.value)}
              />
            </Field>

            <Field>
              <Label htmlFor="customer-business-license">Số đăng ký kinh doanh</Label>
              <Input
                id="customer-business-license"
                value={businessLicenseNumber}
                onChange={(e) => setBusinessLicenseNumber(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <Label htmlFor="customer-credit-limit">Hạn mức tham khảo (đ)</Label>
              <Input
                id="customer-credit-limit"
                type="number"
                min={0}
                step={1}
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="Chỉ để Sales tham khảo - không ảnh hưởng thanh toán thực tế"
              />
            </Field>

            <Field>
              <Label htmlFor="customer-sales-rep">Sales phụ trách</Label>
              <Select value={assignedSalesRepUserId} onValueChange={(v) => setAssignedSalesRepUserId(v ?? NO_SALES_REP_VALUE)}>
                <SelectTrigger id="customer-sales-rep" className="w-full">
                  <SelectValue placeholder="Chưa gán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SALES_REP_VALUE}>Chưa gán</SelectItem>
                  {salesReps.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => router.push("/admin/customers")}>
          Quay lại
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800">
          {isSubmitting ? "Đang lưu..." : "Lưu hồ sơ"}
        </Button>
      </div>
    </form>
  );
}
