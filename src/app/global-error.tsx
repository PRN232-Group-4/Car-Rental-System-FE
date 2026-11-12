"use client";

import "./globals.css";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="min-h-[100dvh] bg-canvas text-ink font-sans antialiased flex items-center justify-center p-4">
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full max-w-md text-center space-y-6 focus:outline-none"
        >
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
              Gián đoạn hệ thống nghiêm trọng
            </h1>
            <p className="text-sm text-ink-3 leading-relaxed max-w-sm mx-auto">
              Đã xảy ra lỗi tại tầng gốc của ứng dụng. Đội ngũ kỹ thuật đã được thông báo.
            </p>

            {error.digest && (
              <p className="font-mono text-[11px] text-ink-3 bg-sunken px-2.5 py-1 inline-block max-w-full truncate border border-line">
                Mã tham chiếu: {error.digest}
              </p>
            )}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải lại hệ thống</span>
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
