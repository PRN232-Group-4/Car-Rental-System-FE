"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { planSchema, type PlanFormValues, type SubscriptionPlan } from "../types";
import { useCreatePlan, useUpdatePlan } from "../hooks";
import { PlanCardPreview } from "./PlanCardPreview";
import { ApiProblemError } from "@/api";

interface PlanDrawerProps {
  open: boolean;
  onClose: () => void;
  planToEdit: SubscriptionPlan | null;
}

export function PlanDrawer({ open, onClose, planToEdit }: PlanDrawerProps) {
  const isEditing = Boolean(planToEdit);
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    values: planToEdit
      ? {
          name: planToEdit.name,
          description: planToEdit.description ?? "",
          price: planToEdit.price,
          durationDays: planToEdit.durationDays,
          includedHours: planToEdit.includedHours,
          isActive: planToEdit.isActive,
        }
      : {
          name: "",
          description: "",
          price: 1_000_000,
          durationDays: 30,
          includedHours: 10,
          isActive: true,
        },
  });

  const watchedValues = watch();

  const onSubmit = async (values: PlanFormValues) => {
    try {
      if (isEditing && planToEdit) {
        await updateMutation.mutateAsync({
          id: planToEdit.id,
          input: values,
        });
        toast.success(`Đã cập nhật gói "${values.name}" thành công`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success(`Đã tạo gói thuê bao "${values.name}" thành công`);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiProblemError) {
        toast.error(err.detail || "Không thể lưu gói thuê bao");
      } else {
        toast.error("Đã xảy ra lỗi khi lưu gói thuê bao");
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      side="right"
      title={isEditing ? `Chỉnh sửa gói: ${planToEdit?.name}` : "Tạo gói thuê bao mới"}
      description="Quản lý hạn mức thời gian và giá thuê bao di chuyển linh hoạt cho khách hàng."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cảnh báo khi sửa gói đã có người mua */}
        {isEditing && (planToEdit?.subscribersCount ?? 0) > 0 && (
          <div className="flex items-start gap-2.5 p-3.5 bg-warning-bg/40 border border-warning/20 rounded text-xs text-td-ink">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong className="text-td-ink font-semibold">Lưu ý quản trị:</strong> Gói này đang có{" "}
              <span className="font-mono font-bold text-td-ink">{planToEdit?.subscribersCount}</span> khách hàng sử dụng. Các thay đổi về giá hoặc hạn mức chỉ áp dụng cho người mua mới từ bây giờ; các gói đã kích hoạt trước đó giữ nguyên quyền lợi.
            </p>
          </div>
        )}

        {/* Tên gói */}
        <FormField
          label="Tên gói thuê bao"
          required
          error={errors.name?.message}
          helperText="Từ 3 đến 80 ký tự"
        >
          <input
            type="text"
            {...register("name")}
            placeholder="Ví dụ: Gói Cuối Tuần Năng Động, Gói Đô Thị 30 Ngày..."
            className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
          />
        </FormField>

        {/* Giá và thời hạn */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Giá trọn gói (VND)"
            required
            error={errors.price?.message}
            helperText="Nhập số nguyên"
          >
            <input
              type="number"
              step="1000"
              {...register("price", { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white font-mono text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
            />
          </FormField>

          <FormField
            label="Số giờ kèm theo"
            required
            error={errors.includedHours?.message}
            helperText="Từ 1 đến 2000 giờ"
          >
            <input
              type="number"
              {...register("includedHours", { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white font-mono text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
            />
          </FormField>

          <FormField
            label="Thời hạn (ngày)"
            required
            error={errors.durationDays?.message}
            helperText="Từ 1 đến 365 ngày"
          >
            <input
              type="number"
              {...register("durationDays", { valueAsNumber: true })}
              className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white font-mono text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
            />
          </FormField>
        </div>

        {/* Mô tả */}
        <FormField
          label="Mô tả gói thuê bao"
          error={errors.description?.message}
          helperText="Tối đa 500 ký tự"
        >
          <textarea
            rows={3}
            {...register("description")}
            placeholder="Nêu rõ đối tượng phù hợp và quyền lợi nổi bật của gói..."
            className="w-full p-3 rounded border border-td-rule bg-td-white text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
          />
        </FormField>

        {/* Công tắc mở bán */}
        <div className="flex items-center justify-between p-3.5 bg-td-white rounded border border-td-rule">
          <div>
            <span className="text-sm font-bold text-td-ink block">Mở bán gói thuê bao</span>
            <span className="text-xs text-td-muted block">
              Cho phép khách hàng tìm thấy và đăng ký thanh toán gói này trên ứng dụng.
            </span>
          </div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-td-oxide/20 ${
                  field.value ? "bg-td-oxide" : "bg-line-strong"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    field.value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            )}
          />
        </div>

        {/* Thẻ xem trước trực tiếp */}
        <PlanCardPreview plan={watchedValues} subscribersCount={planToEdit?.subscribersCount} />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-td-rule">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isEditing ? (
              <>
                <Edit2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>{isPending ? "Đang lưu..." : "Cập nhật gói"}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>{isPending ? "Đang lưu..." : "Tạo gói mới"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
