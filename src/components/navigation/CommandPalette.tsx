"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { gsap } from "@/lib/motion/register";
import styles from "@/features/admin/transit-desk/transit-desk.module.css";

export interface CommandRoute {
  chapter: string;
  href: string;
  label: string;
  description?: string;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  /** Danh sách route đã được lọc theo quyền của cổng đang dùng. */
  routes: CommandRoute[];
  /** Khoá localStorage giữ danh sách route mở gần đây, mỗi cổng một khoá. */
  storageKey: string;
  title?: string;
  placeholder?: string;
  emptyHint?: string;
}

const readRecent = (storageKey: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const writeRecent = (storageKey: string, href: string) => {
  if (typeof window === "undefined") return;
  try {
    const next = [href, ...readRecent(storageKey).filter((item) => item !== href)].slice(0, 5);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // localStorage bị chặn: bỏ qua, không chặn điều hướng
  }
};

/**
 * Bảng tìm kiếm chức năng dùng chung cho mọi cổng (mở bằng Ctrl/⌘ + K).
 * Route được truyền vào từ shell của từng cổng để giữ đúng phân quyền và nhãn.
 */
export function CommandPalette({
  isOpen,
  onClose,
  routes,
  storageKey,
  title = "Tìm chức năng",
  placeholder = "Gõ tên nghiệp vụ, nhóm hoặc đường dẫn...",
  emptyHint = "Không tìm thấy chức năng phù hợp.",
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Palette được mount lại mỗi lần mở nên chỉ cần đọc localStorage một lần.
  const [recentHrefs] = useState<string[]>(() => readRecent(storageKey));
  const inputRef = useRef<HTMLInputElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const recentRoutes = useMemo(() => {
    if (!isOpen) return [];
    return recentHrefs
      .map((href) => routes.find((route) => route.href === href))
      .filter((route): route is CommandRoute => route != null);
  }, [recentHrefs, routes, isOpen]);

  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (route) =>
        route.label.toLowerCase().includes(q) ||
        route.href.toLowerCase().includes(q) ||
        route.chapter.toLowerCase().includes(q),
    );
  }, [routes, query]);

  // Escape đóng bảng
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus & hiệu ứng mở/đóng
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => inputRef.current?.focus(), 50);

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

      if (!prefersReduced && dialogRef.current && scrimRef.current) {
        gsap.fromTo(scrimRef.current, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
        gsap.fromTo(
          dialogRef.current,
          { scale: 0.94, y: -12, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.32, ease: "back.out(1.4)" },
        );
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    dialogRef.current.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    dialogRef.current.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
    dialogRef.current.style.setProperty("--spotlight-opacity", "1");
  };

  const handlePointerLeave = () => {
    dialogRef.current?.style.setProperty("--spotlight-opacity", "0");
  };

  // Giữ focus trong dialog
  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredRoutes.length || 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? filteredRoutes.length - 1 : prev - 1));
    } else if (event.key === "Enter" && filteredRoutes[selectedIndex]) {
      event.preventDefault();
      handleSelect(filteredRoutes[selectedIndex].href);
    }
  };

  const handleSelect = (href: string) => {
    writeRecent(storageKey, href);
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div ref={scrimRef} role="presentation" onClick={onClose} className={styles.routeIndexScrim}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="commandPaletteTitle"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={styles.routeIndexDialog}
      >
        <div className={styles.routeIndexSpotlight} aria-hidden="true" />

        <div className="flex items-center justify-between border-b border-td-rule bg-td-white px-5 py-3.5">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
              WAYFINDING · ROUTE ATLAS
            </span>
            <h2 id="commandPaletteTitle" className="text-lg font-bold text-td-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng tìm kiếm"
            className="cursor-pointer rounded p-1 text-td-muted hover:bg-td-chalk hover:text-td-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="relative border-b border-td-rule bg-td-white px-5 py-3">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-td-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleListKeyDown}
            placeholder={placeholder}
            aria-label="Tìm kiếm route"
            className="w-full bg-transparent pl-8 pr-4 text-sm font-medium text-td-ink placeholder-td-muted outline-none"
          />
        </div>

        {!query.trim() && recentRoutes.length > 0 && (
          <div className="border-b border-td-rule bg-td-white/60 px-5 py-2">
            <span className="mb-1 block font-mono text-[10px] font-bold uppercase text-td-muted">
              GẦN ĐÂY / RECENT
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentRoutes.map((route) => (
                <button
                  key={`recent-${route.href}`}
                  type="button"
                  onClick={() => handleSelect(route.href)}
                  className="cursor-pointer rounded border border-td-rule bg-td-paper px-2 py-0.5 font-mono text-[11px] text-td-ink transition-colors hover:border-td-ink"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredRoutes.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-td-muted">{emptyHint}</div>
          ) : (
            filteredRoutes.map((route, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={route.href}
                  type="button"
                  onClick={() => handleSelect(route.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`${styles.routeIndexItem} ${isSelected ? styles.routeIndexItemSelected : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 font-mono text-[11px] font-semibold uppercase text-td-muted">
                      {route.chapter}
                    </span>
                    <span className="truncate text-sm font-semibold">{route.label}</span>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-td-muted">{route.href}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end border-t border-td-rule bg-td-white px-5 py-2.5 font-mono text-[11px] text-td-muted">
          <div className="flex items-center gap-2">
            <span>↑↓ Di chuyển</span>
            <span>↵ Mở</span>
            <span>ESC Đóng</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nút "Tìm" + tổ hợp ⌘K trên masthead, dùng chung cho mọi cổng. */
export function CommandTrigger({ onClick, label = "Tìm" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.commandTrigger}
      aria-label={`${label} chức năng (Ctrl+K)`}
    >
      <Search className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
      <kbd>⌘ K</kbd>
    </button>
  );
}

export default CommandPalette;
