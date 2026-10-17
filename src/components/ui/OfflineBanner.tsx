"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      if (timer) clearTimeout(timer);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const id = setTimeout(() => setIsOnline(false), 0);
      return () => {
        clearTimeout(id);
        if (timer) clearTimeout(timer);
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] px-4 pointer-events-none w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {!isOnline ? (
        <div className="glass-2 border border-danger/30 bg-danger/10 text-danger px-4 py-3 rounded-2xl shadow-e3 pointer-events-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2.5 min-w-0">
            <WifiOff className="w-4 h-4 shrink-0 text-danger animate-pulse" />
            <span className="truncate">
              Mất kết nối mạng. Hệ thống đang hoạt động ngoại tuyến.
            </span>
          </div>
        </div>
      ) : showReconnected ? (
        <div className="glass-2 border border-success/30 bg-success-bg text-success px-4 py-3 rounded-2xl shadow-e3 pointer-events-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2.5 min-w-0">
            <Wifi className="w-4 h-4 shrink-0 text-success" />
            <span className="truncate">Đã khôi phục kết nối Internet.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
