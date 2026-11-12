import type { ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  traceId?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Đã xảy ra lỗi",
  message,
  error,
  traceId: explicitTraceId,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  // Trích xuất message và traceId từ error object nếu có
  const resolvedMessage =
    message ||
    (error instanceof Error ? error.message : null) ||
    "Không thể tải hoặc xử lý dữ liệu yêu cầu. Vui lòng thử lại.";

  const resolvedTraceId =
    explicitTraceId ||
    (error && typeof error === "object" && "traceId" in error
      ? String((error as { traceId: unknown }).traceId)
      : undefined);

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 border-l-2 border-danger bg-td-white px-5 py-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-td-ink">{title}</h3>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-td-muted">{resolvedMessage}</p>
          {resolvedTraceId && (
            <p className="mt-2 inline-block border border-td-rule px-2 py-1 font-mono text-[11px] text-td-muted">
              Mã tham chiếu: <span className="select-all">{resolvedTraceId}</span>
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 border border-td-rule px-3 py-1.5 text-xs font-bold text-td-ink transition-colors hover:bg-td-chalk"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thử lại</span>
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

export default ErrorState;
