"use client";

import { useEffect } from "react";
import Link from "@/components/navigation/NavigationLink";
import { RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for telemetry if needed
    console.error("[Route Error Boundary]", error);
  }, [error]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[100dvh] bg-canvas text-ink flex items-center justify-center p-4 sm:p-6 focus:outline-none"
    >
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Đã xảy ra sự cố kỹ thuật
          </h1>
          <p className="text-sm text-ink-3 leading-relaxed max-w-sm mx-auto">
            Hệ thống gặp sự cố ngoài dự kiến trong lúc xử lý yêu cầu. Vui lòng thử lại hoặc trở về trang chủ.
          </p>

          {error.digest && (
            <p className="font-mono text-[11px] text-ink-3 bg-sunken px-2.5 py-1 inline-block max-w-full truncate border border-line">
              Mã tham chiếu: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-canvas transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
