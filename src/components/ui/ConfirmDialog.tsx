"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isPending?: boolean;
  icon?: ReactNode;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  isPending = false,
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog.Root open={open} onOpenChange={isPending ? () => {} : onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-scrim transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 border border-line bg-surface p-6 shadow-e2 transition-all",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center",
                isDanger
                  ? "bg-danger-bg text-danger"
                  : "bg-primary-tint text-primary",
              )}
            >
              {icon ?? <AlertTriangle className="h-5 w-5" aria-hidden="true" />}
            </div>

            <div className="flex-1">
              <Dialog.Title className="text-lg font-bold text-ink">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm leading-relaxed text-ink-3">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 items-center justify-center border border-line bg-surface px-4 text-sm font-semibold text-ink-2 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                void onConfirm();
              }}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                isDanger
                  ? "bg-danger hover:bg-danger-hover active:bg-danger-hover"
                  : "bg-primary hover:bg-primary-hover active:bg-primary-press",
              )}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default ConfirmDialog;
