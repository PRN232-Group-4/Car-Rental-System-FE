import type { ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  title?: string;
  message: string;
  traceId?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Đã xảy ra lỗi",
  message,
  traceId,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger-bg/30 p-6 text-center sm:p-8",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-bg text-danger shadow-e1">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-2">{message}</p>
      {traceId && (
        <p className="mt-2 text-xs font-mono text-ink-3 bg-surface px-2.5 py-1 rounded-md border border-line">
          Mã tham chiếu: <span className="select-all">{traceId}</span>
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover active:bg-primary-press"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Thử lại</span>
          </button>
        )}
        {action}
      </div>
    </div>
  );
}

export default ErrorState;
