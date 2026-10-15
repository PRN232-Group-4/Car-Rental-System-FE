"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./FormDialog.module.css";

export function FormDialogFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer} data-dialog-footer>{children}</div>;
}

export default function FormDialog({ title, children, onClose, busy = false, size = "md" }: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  size?: "md" | "xl";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    // Start with the form rather than its dismiss button; native dialog keeps
    // keyboard focus inside and restores the opener when it closes.
    dialog.querySelector<HTMLElement>("input:not([type=hidden]):not(:disabled), select:not(:disabled), textarea:not(:disabled)")?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (busy || event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
      className={`${styles.dialog} fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${size === "xl" ? "max-w-5xl" : "max-w-2xl"} overflow-y-auto rounded-2xl border border-line bg-surface p-0 text-ink shadow-e2 backdrop:bg-stage-ink/50`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4 sm:px-6">
        <h2 id={titleId} className="text-base font-bold">{title}</h2>
        <button type="button" disabled={busy} onClick={onClose} aria-label="Đóng biểu mẫu" className="rounded-lg p-2 text-ink-3 transition hover:bg-sunken hover:text-ink disabled:opacity-50">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
