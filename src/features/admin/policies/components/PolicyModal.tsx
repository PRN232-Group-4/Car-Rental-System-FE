"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { policySchema, type PolicyFormValues, type RentalPolicy, type VehicleTypeOption } from "../types";
import { useCreatePolicy } from "../hooks";
import { PolicyDiff } from "./PolicyDiff";
import { ApiProblemError } from "@/api";

interface PolicyModalProps {
  open: boolean;
  onClose: () => void;
  vehicleTypes: VehicleTypeOption[];
  activePolicies: RentalPolicy[];
}

export function PolicyModal({
  open,
  onClose,
  vehicleTypes,
  activePolicies,
}: PolicyModalProps) {
  const [confirmPending, setConfirmPending] = useState<PolicyFormValues | null>(null);
  const createMutation = useCreatePolicy();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      vehicleTypeId: vehicleTypes[0]?.id ?? 1,
      name: "",
      vatRate: 10,
      overtimeFeeRate: 15,
      depositPercentage: 10,
      isActive: true,
    },
  });

  const selectedVehicleTypeId = watch("vehicleTypeId");
  const watchedValues = watch();

  const currentActivePolicy =
    activePolicies.find((p) => p.vehicleTypeId === Number(selectedVehicleTypeId)) ?? null;
  const selectedVehicleType = vehicleTypes.find(
    (v) => v.id === Number(selectedVehicleTypeId)
  );

  const handleCopyFromCurrent = () => {
    if (!currentActivePolicy) return;
    setValue("vatRate", currentActivePolicy.vatRate);
    setValue("overtimeFeeRate", currentActivePolicy.overtimeFeeRate);
    setValue("depositPercentage", currentActivePolicy.depositPercentage);
    setValue("name", `${currentActivePolicy.name} (Tái bản ${new Date().getFullYear()})`);
    toast.info("Đã sao chép các thông số từ phiên bản đang áp dụng");
  };

  const executeCreate = async (values: PolicyFormValues) => {
    try {
      await createMutation.mutateAsync({
        vehicleTypeId: Number(values.vehicleTypeId),
        name: values.name.trim(),
        vatRate: Number(values.vatRate),
        overtimeFeeRate: Number(values.overtimeFeeRate),
        depositPercentage: Number(values.depositPercentage),
        isActive: Boolean(values.isActive),
      });

      toast.success("Đã tạo phiên bản chính sách thuê thành công");
      reset();
      setConfirmPending(null);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiProblemError) {
        toast.error(err.detail || "Không thể tạo chính sách");
      } else {
        toast.error("Đã xảy ra lỗi khi tạo chính sách");
      }
    }
  };

  const onSubmit = (values: PolicyFormValues) => {
    // Nếu áp dụng ngay và đã có chính sách active cũ -> mở ConfirmDialog cảnh báo
    if (values.isActive && currentActivePolicy) {
      setConfirmPending(values);
    } else {
      executeCreate(values);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(isOpen) => !isOpen && onClose()}
        size="lg"
        title="Tạo phiên bản chính sách thuê mới"
        description="Chính sách thuê là bất biến để bảo vệ hợp đồng đã ký. Mọi thay đổi đều được tạo dưới dạng phiên bản mới."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Chọn loại xe áp dụng */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="vehicleTypeId"
                className="block text-xs font-bold text-td-ink"
              >
                Loại xe áp dụng <span className="text-td-oxide">*</span>
              </label>
              {currentActivePolicy && (
                <button
                  type="button"
                  onClick={handleCopyFromCurrent}
                  className="inline-flex items-center gap-1 text-xs text-td-oxide hover:underline font-medium"
                >
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sao chép bản đang áp dụng</span>
                </button>
              )}
            </div>
            <Controller
              name="vehicleTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  id="vehicleTypeId"
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(next) => field.onChange(Number(next))}
                  options={vehicleTypes.map((vt) => ({ value: String(vt.id), label: vt.name }))}
                  placeholder="Chọn loại xe"
                  menuLabel="Loại xe áp dụng"
                  aria-invalid={!!errors.vehicleTypeId}
                  className="h-11 border-td-rule bg-td-white px-3.5 text-td-ink"
                />
              )}
            />
            {errors.vehicleTypeId && (
              <p className="text-xs text-danger mt-1">{errors.vehicleTypeId.message}</p>
            )}
          </div>

          {/* Tên phiên bản chính sách */}
          <FormField
            label="Tên phiên bản chính sách"
            required
            error={errors.name?.message}
            helperText="Ví dụ: Chính sách Ô tô cao điểm Hè 2026, Điều khoản tiêu chuẩn 2026-V2"
          >
            <input
              type="text"
              {...register("name")}
              placeholder="Nhập tên gọi phiên bản..."
              className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
            />
          </FormField>

          {/* Nhóm tỷ lệ phần trăm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label="Thuế VAT (%)"
              required
              error={errors.vatRate?.message}
              helperText="Từ 0 đến 100%"
            >
              <input
                type="number"
                step="0.01"
                {...register("vatRate", { valueAsNumber: true })}
                className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white font-mono text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
              />
            </FormField>

            <FormField
              label="Đặt cọc (%)"
              required
              error={errors.depositPercentage?.message}
              helperText="Tỷ lệ tính trên tiền thuê"
            >
              <input
                type="number"
                step="0.01"
                {...register("depositPercentage", { valueAsNumber: true })}
                className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white font-mono text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
              />
            </FormField>

            <FormField
              label="Phí trả trễ (%)"
              required
              error={errors.overtimeFeeRate?.message}
              helperText="Phí phạt mỗi giờ trễ"
            >
              <input
                type="number"
                step="0.01"
                {...register("overtimeFeeRate", { valueAsNumber: true })}
                className="w-full h-11 px-3.5 rounded border border-td-rule bg-td-white font-mono text-td-ink text-sm focus:outline-none focus:ring-2 focus:ring-td-oxide/20 focus:border-td-oxide"
              />
            </FormField>
          </div>

          {/* Công tắc áp dụng ngay */}
          <div className="flex items-center justify-between gap-4 p-3.5 bg-td-white rounded border border-td-rule">
            <div>
              <span className="text-sm font-bold text-td-ink block">Áp dụng ngay cho đơn mới</span>
              <span className="text-xs text-td-muted block">
                Nếu bật, hệ thống sẽ sử dụng phiên bản này cho tất cả đơn thuê tạo sau thời điểm này.
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

          {/* Bảng so sánh và minh họa tính giá */}
          <PolicyDiff
            currentPolicy={currentActivePolicy}
            newValues={watchedValues}
            vehicleTypeName={selectedVehicleType?.name}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-td-rule">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || createMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span>{isSubmitting || createMutation.isPending ? "Đang lưu..." : "Tạo phiên bản mới"}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* ConfirmDialog khi thay thế chính sách đang active */}
      {confirmPending && currentActivePolicy && (
        <ConfirmDialog
          open={Boolean(confirmPending)}
          onOpenChange={(isOpen) => !isOpen && setConfirmPending(null)}
          title="Xác nhận thay thế chính sách đang áp dụng"
          description={`Loại xe "${selectedVehicleType?.name ?? ""}" hiện đang áp dụng chính sách "${currentActivePolicy.name}" (ID #${currentActivePolicy.id}). Việc kích hoạt phiên bản mới sẽ thay thế chính sách này cho mọi đơn thuê được tạo từ thời điểm này trở đi.`}
          confirmLabel="Đồng ý áp dụng ngay"
          cancelLabel="Xem lại"
          variant="primary"
          onConfirm={() => executeCreate(confirmPending)}
        />
      )}
    </>
  );
}
