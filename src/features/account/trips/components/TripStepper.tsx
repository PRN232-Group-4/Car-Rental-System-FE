import { Check, X } from "lucide-react";
import type { TripStatus } from "../types";

interface TripStepperProps {
  status: TripStatus;
  cancelReason?: string;
  cancelledAt?: string;
}

interface StepItem {
  key: string;
  label: string;
  description: string;
}

const NORMAL_STEPS: StepItem[] = [
  { key: "pending", label: "Đã đặt xe", description: "Xác nhận đặt & cọc" },
  { key: "pre_inspection", label: "Kiểm định giao", description: "Ký nhận tình trạng xe" },
  { key: "renting", label: "Đang di chuyển", description: "Hành trình bắt đầu" },
  { key: "post_inspection", label: "Trả xe & kiểm tra", description: "Bàn giao lại trạm" },
  { key: "completed", label: "Hoàn tất chuyến", description: "Quyết toán hoàn tất" },
];

export function TripStepper({ status, cancelReason }: TripStepperProps) {
  if (status === "cancelled") {
    return (
      <div className="bg-td-white rounded border border-td-rule p-5">
        <h3 className="text-xs font-bold text-td-muted mb-4">
          Tiến trình đơn thuê
        </h3>
        <ol className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-td-muted">
              <Check className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-td-ink block">Đã tạo đơn</span>
              <span className="text-xs text-td-muted">Hoàn tất đặt ban đầu</span>
            </div>
          </li>
          <div className="hidden sm:block flex-1 h-0.5 bg-danger/30" aria-hidden="true" />
          <li className="flex items-center gap-3" aria-current="step">
            <div className="w-8 h-8 rounded-full bg-danger-bg border border-danger/30 flex items-center justify-center text-danger">
              <X className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-sm font-bold text-danger block">Đã hủy chuyến</span>
              <span className="text-xs text-td-muted">
                {cancelReason || "Đơn thuê đã được chấm dứt"}
              </span>
            </div>
          </li>
        </ol>
      </div>
    );
  }

  // Xác định bước hiện tại
  const stepOrder: Record<TripStatus, number> = {
    pending: 0,
    pre_inspection: 1,
    renting: 2,
    post_inspection: 3,
    completed: 4,
    cancelled: -1,
  };

  const currentIndex = stepOrder[status] ?? 0;

  return (
    <div className="bg-td-white rounded border border-td-rule p-5">
      <h3 className="text-xs font-bold text-td-muted mb-4">
        Tiến trình đơn thuê
      </h3>
      <ol className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        {NORMAL_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? "step" : undefined}
              className="flex sm:flex-col items-center sm:items-start gap-3 relative"
            >
              {/* Vòng tròn biểu tượng */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-primary text-white"
                    : isCurrent
                    ? "bg-primary-tint border-2 border-primary text-primary"
                    : "bg-td-chalk border border-td-rule text-td-muted"
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Nhãn và mô tả */}
              <div>
                <span
                  className={`text-xs font-bold block ${
                    isCurrent ? "text-primary" : isDone ? "text-td-ink" : "text-td-muted"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[11px] text-td-muted hidden sm:block mt-0.5">
                  {step.description}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
