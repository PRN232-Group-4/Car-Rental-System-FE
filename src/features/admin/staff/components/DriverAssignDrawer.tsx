import React, { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAssignableDrivers, useAssignDriver } from "../hooks";
import { mapIneligibleReason } from "../license-utils";
import type { AssignDriverReason } from "../types";
import {
  UserCheck,
  AlertTriangle,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export interface DriverAssignDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: number;
  rentalCode?: string;
  vehicleName?: string;
  timeRange?: string;
  currentDriverName?: string;
  onSuccess?: () => void;
}

export function DriverAssignDrawer({
  open,
  onOpenChange,
  rentalId,
  rentalCode = `#${rentalId}`,
  vehicleName = "VinFast VF 9",
  timeRange = "Hôm nay, 08:00 - 18:00 (GMT+7)",
  currentDriverName,
  onSuccess,
}: DriverAssignDrawerProps) {
  const { data: drivers = [], isLoading, error } = useAssignableDrivers(rentalId);
  const assignDriverMutation = useAssignDriver();

  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [reason, setReason] = useState<AssignDriverReason>("driver_request");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedDriver = drivers.find((d) => d.staffId === selectedStaffId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedStaffId) {
      setValidationError("Vui lòng chọn một tài xế khả dụng trong danh sách.");
      return;
    }

    if (selectedDriver && !selectedDriver.eligible) {
      setValidationError("Không thể chọn tài xế không đủ điều kiện vận hành.");
      return;
    }

    try {
      await assignDriverMutation.mutateAsync({
        rentalId,
        driverStaffId: selectedStaffId,
        reason,
        notes: notes.trim(),
      });
      onSuccess?.();
      onOpenChange(false);
    } catch {
      // Đã xử lý toast ở mutation
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title={
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" />
          <span>{currentDriverName ? "Điều Phối / Thay Đổi Tài Xế" : "Chỉ Định Tài Xế Cho Đơn Thuê"}</span>
        </div>
      }
      description={`Đơn thuê ${rentalCode} • Phương tiện: ${vehicleName}`}
      className="w-full sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col justify-between">
        <div className="space-y-6 overflow-y-auto p-4 sm:p-6 flex-1">
          {/* Thông tin vắn tắt về đơn thuê */}
          <div className="rounded-2xl border border-line bg-canvas p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-3">Khung giờ di chuyển:</span>
              <span className="font-bold text-ink flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {timeRange}
              </span>
            </div>
            {currentDriverName && (
              <div className="flex items-center justify-between border-t border-line/60 pt-2">
                <span className="text-ink-3">Tài xế hiện tại:</span>
                <span className="font-bold text-ink-2">{currentDriverName}</span>
              </div>
            )}
          </div>

          {/* Danh sách tài xế */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Danh sách tài xế ({drivers.length})
              </h4>
              <span className="text-[11px] text-ink-3">Đã tính 60 phút đệm</span>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-sunken animate-pulse" />
                <div className="h-16 rounded-xl bg-sunken animate-pulse" />
                <div className="h-16 rounded-xl bg-sunken animate-pulse" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-danger/30 bg-danger-bg/40 p-4 text-xs text-danger text-center">
                Không thể tải danh sách tài xế khả dụng.
              </div>
            ) : drivers.length === 0 ? (
              <div className="rounded-xl border border-line bg-surface p-6 text-xs text-ink-3 text-center">
                Không có tài xế nào trong hệ thống.
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {drivers.map((d) => {
                  const isSelected = selectedStaffId === d.staffId;
                  const isEligible = d.eligible;

                  return (
                    <div
                      key={d.staffId}
                      onClick={() => {
                        if (isEligible) {
                          setSelectedStaffId(d.staffId);
                          if (validationError) setValidationError(null);
                        }
                      }}
                      className={`relative rounded-xl border p-3.5 transition-all cursor-pointer ${
                        !isEligible
                          ? "border-line/70 bg-sunken/40 opacity-75 cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary-tint/20 ring-2 ring-primary/20 shadow-xs"
                          : "border-line bg-surface hover:border-primary/50 hover:bg-canvas"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface font-mono text-xs font-bold text-primary shadow-xs">
                            {d.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(-2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-ink">{d.fullName}</span>
                              {d.rating && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-sunken px-1.5 py-0.5 text-[10px] font-bold text-ink-2">
                                  <Star className="w-3 h-3 text-primary fill-primary" />
                                  <span>{d.rating.toFixed(1)}</span>
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs text-ink-3">
                              {d.licenseType ? `Hạng ${d.licenseType} • Số: ${d.licenseNumber || "—"}` : "Chưa có GPLX"}
                            </p>
                          </div>
                        </div>

                        {/* Trạng thái hợp lệ */}
                        <div className="text-right shrink-0">
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-bg/40 border border-success/30 px-2 py-0.5 font-sans text-[11px] font-bold text-success">
                              <CheckCircle2 className="w-3 h-3" />
                              Khả dụng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg/40 border border-danger/30 px-2 py-0.5 font-sans text-[11px] font-bold text-danger">
                              <XCircle className="w-3 h-3" />
                              Không phù hợp
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hiển thị lý do loại trừ nếu không hợp lệ */}
                      {!isEligible && d.reasons.length > 0 && (
                        <div className="mt-2.5 rounded-lg border border-danger/20 bg-danger-bg/30 p-2 text-xs text-danger space-y-1">
                          {d.reasons.map((r, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{mapIneligibleReason(r)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lý do và ghi chú */}
          <div className="space-y-4 pt-2 border-t border-line">
            <FormField label="Lý do điều phối / thay đổi" required>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as AssignDriverReason)}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="driver_request">Yêu cầu từ tài xế (Bận đột xuất/sức khỏe)</option>
                <option value="customer_request">Khách hàng yêu cầu đổi tài xế</option>
                <option value="driver_unavailable">Tài xế trước đó không liên lạc được</option>
                <option value="other">Lý do điều phối nghiệp vụ khác</option>
              </select>
            </FormField>

            <FormField label="Ghi chú nội bộ">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Nhập ghi chú chi tiết nếu có..."
                className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </FormField>
          </div>

          {validationError && (
            <div className="rounded-xl border border-danger/30 bg-danger-bg/40 p-3 text-xs font-medium text-danger">
              {validationError}
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 border-t border-line bg-surface p-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={assignDriverMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedStaffId || assignDriverMutation.isPending}
          >
            {assignDriverMutation.isPending ? "Đang gán..." : "Xác nhận điều phối"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
