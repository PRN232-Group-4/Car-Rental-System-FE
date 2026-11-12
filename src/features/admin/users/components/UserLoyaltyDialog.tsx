"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Award, PlusCircle, MinusCircle } from "lucide-react";

export interface UserLoyaltyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: number;
  customerName: string;
  currentPoints: number;
  onAdjust: (points: number, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserLoyaltyDialog({
  open,
  onOpenChange,
  customerName,
  currentPoints,
  onAdjust,
  isLoading = false,
}: UserLoyaltyDialogProps) {
  const [pointDelta, setPointDelta] = useState<number | "">("");
  const [direction, setDirection] = useState<"add" | "subtract">("add");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointDelta || Number(pointDelta) <= 0) {
      setError("Vui lòng nhập số điểm hợp lệ lớn hơn 0.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 5 || reason.trim().length > 255) {
      setError("Lý do điều chỉnh phải từ 5 đến 255 ký tự.");
      return;
    }

    const finalPoints = direction === "add" ? Number(pointDelta) : -Number(pointDelta);
    if (currentPoints + finalPoints < 0) {
      setError(`Số dư hiện tại (${currentPoints} điểm) không đủ để trừ ${pointDelta} điểm.`);
      return;
    }

    setError(null);
    await onAdjust(finalPoints, reason.trim());
    setPointDelta("");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Điều chỉnh điểm thưởng hội viên"
      description={`Cộng hoặc trừ điểm thưởng thủ công cho khách hàng ${customerName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between rounded border border-td-rule bg-td-paper p-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-td-oxide" />
            <span className="text-xs font-semibold text-td-muted">Số dư điểm hiện tại:</span>
          </div>
          <span className="font-mono text-base font-black tabular-nums text-td-oxide">
            {currentPoints.toLocaleString("vi-VN")} điểm
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDirection("add")}
            className={`flex items-center justify-center gap-2 rounded border p-3 text-xs font-bold transition-all cursor-pointer ${
              direction === "add"
                ? "border-td-oxide bg-td-chalk text-td-oxide"
                : "border-td-rule bg-td-white text-td-muted hover:text-td-ink"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cộng điểm thưởng</span>
          </button>
          <button
            type="button"
            onClick={() => setDirection("subtract")}
            className={`flex items-center justify-center gap-2 rounded border p-3 text-xs font-bold transition-all cursor-pointer ${
              direction === "subtract"
                ? "border-danger bg-danger-bg/40 text-danger"
                : "border-td-rule bg-td-white text-td-muted hover:text-td-ink"
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            <span>Trừ điểm thưởng</span>
          </button>
        </div>

        <FormField label="Số điểm điều chỉnh" required>
          <input
            type="number"
            min="1"
            value={pointDelta}
            onChange={(e) => {
              setPointDelta(e.target.value === "" ? "" : Math.abs(parseInt(e.target.value, 10)));
              if (error) setError(null);
            }}
            placeholder="Ví dụ: 100"
            className="flex h-11 w-full rounded border border-td-rule bg-td-white px-3 text-sm font-mono font-bold text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
          />
        </FormField>

        <FormField
          label="Lý do điều chỉnh (Bắt buộc)"
          required
          error={error || undefined}
          helperText="5 đến 255 ký tự, được lưu vào sổ cái giao dịch điểm của khách hàng."
        >
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            rows={2}
            placeholder="Ví dụ: Đền bù trải nghiệm dịch vụ chuyến thuê #409..."
            className="w-full rounded border border-td-rule bg-td-white p-3 text-sm text-td-ink focus:border-td-oxide focus:outline-none focus:ring-2 focus:ring-td-oxide/20"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-td-rule">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Lưu thay đổi điểm
          </Button>
        </div>
      </form>
    </Modal>
  );
}
