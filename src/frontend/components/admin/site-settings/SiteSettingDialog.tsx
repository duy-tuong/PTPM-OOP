"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createSiteSettingAction, updateSiteSettingAction } from "@/app/admin/site-settings/actions";
import type { AdminSiteSettingDto } from "@/lib/types/admin";

interface SiteSettingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: AdminSiteSettingDto | null;
}

interface FormState {
  settingKey: string;
  settingValue: string;
  settingGroup: string;
  dataType: string;
}

const EMPTY_FORM: FormState = { settingKey: "", settingValue: "", settingGroup: "", dataType: "string" };

interface FormErrors {
  settingKey?: string;
  settingValue?: string;
  settingGroup?: string;
}

// DataType chỉ là string tự do phía backend (không có enum tương ứng) - dùng literal "string"/
// "number"/"boolean" thay vì enum, mirror cấu trúc JSX Select của PromotionDialog.tsx (discountType).
export function SiteSettingDialog({ open, onOpenChange, setting }: SiteSettingDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (setting) {
        setForm({
          settingKey: setting.settingKey,
          settingValue: setting.settingValue,
          settingGroup: setting.settingGroup,
          dataType: setting.dataType,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, setting]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.settingKey.trim()) nextErrors.settingKey = "Vui lòng nhập khoá cấu hình";
    else if (form.settingKey.length > 100) nextErrors.settingKey = "Khoá tối đa 100 ký tự";
    if (!form.settingValue.trim()) nextErrors.settingValue = "Vui lòng nhập giá trị";
    else if (form.settingValue.length > 2000) nextErrors.settingValue = "Giá trị tối đa 2000 ký tự";
    if (!form.settingGroup.trim()) nextErrors.settingGroup = "Vui lòng nhập nhóm cấu hình";
    else if (form.settingGroup.length > 50) nextErrors.settingGroup = "Nhóm tối đa 50 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const dto = {
        settingKey: form.settingKey.trim(),
        settingValue: form.settingValue.trim(),
        settingGroup: form.settingGroup.trim(),
        dataType: form.dataType,
      };

      const result = setting
        ? await updateSiteSettingAction(setting.id, dto)
        : await createSiteSettingAction(dto);

      if (!result.success) {
        if (result.message.includes("Khoá cấu hình")) {
          setErrors((prev) => ({ ...prev, settingKey: result.message }));
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(setting ? "Đã cập nhật cấu hình" : "Đã thêm cấu hình mới");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{setting ? "Sửa cấu hình" : "Thêm cấu hình"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="setting-key">Khoá cấu hình</Label>
              <Input
                id="setting-key"
                value={form.settingKey}
                placeholder="vd: contact.hotline"
                onChange={(e) => setForm((prev) => ({ ...prev, settingKey: e.target.value }))}
                aria-invalid={!!errors.settingKey}
              />
              <FieldError errors={errors.settingKey ? [{ message: errors.settingKey }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="setting-value">Giá trị</Label>
              <Textarea
                id="setting-value"
                value={form.settingValue}
                onChange={(e) => setForm((prev) => ({ ...prev, settingValue: e.target.value }))}
                aria-invalid={!!errors.settingValue}
              />
              <FieldError errors={errors.settingValue ? [{ message: errors.settingValue }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="setting-group">Nhóm cấu hình</Label>
              <Input
                id="setting-group"
                value={form.settingGroup}
                placeholder="vd: general, contact"
                onChange={(e) => setForm((prev) => ({ ...prev, settingGroup: e.target.value }))}
                aria-invalid={!!errors.settingGroup}
              />
              <FieldError errors={errors.settingGroup ? [{ message: errors.settingGroup }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="setting-datatype">Kiểu dữ liệu</Label>
              <Select
                items={[
                  { value: "string", label: "Chuỗi (string)" },
                  { value: "number", label: "Số (number)" },
                  { value: "boolean", label: "Đúng/Sai (boolean)" },
                ]}
                value={form.dataType}
                onValueChange={(value) => setForm((prev) => ({ ...prev, dataType: value ?? prev.dataType }))}
              >
                <SelectTrigger id="setting-datatype" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">Chuỗi (string)</SelectItem>
                  <SelectItem value="number">Số (number)</SelectItem>
                  <SelectItem value="boolean">Đúng/Sai (boolean)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
