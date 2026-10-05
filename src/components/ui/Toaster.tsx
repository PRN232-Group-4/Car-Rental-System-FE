"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

/** Toaster dùng chung: tối đa 3 toast, thành công 4s, lỗi 8s (FE-20 G). */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      visibleToasts={3}
      duration={4000}
      gap={10}
      offset={16}
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-line bg-surface text-sm text-ink shadow-e2 whitespace-pre-line",
          title: "font-semibold whitespace-pre-line",
          description: "text-xs text-ink-3 whitespace-pre-line",
          error: "text-danger",
          success: "text-primary",
        },
      }}
    />
  );
}

/** Message BE trả về (ApiClientError) hoặc lỗi bất kỳ; fallback khi không đọc được. */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message, { duration: 8000 });
}

export function notifyApiError(error: unknown, fallback: string) {
  toast.error(errorMessage(error, fallback), { duration: 8000 });
}
