"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { ADMIN_NAV_ITEMS, type NavItem } from "@/config/navigation";
import { hasAnyRole } from "@/features/auth/access";
import type { Role } from "@/features/auth/roles";

export interface TransitDeskRouteIndexProps {
  isOpen: boolean;
  onClose: () => void;
  userRoles?: readonly Role[];
}

export interface RouteEntry {
  chapter: string;
  href: string;
  label: string;
  description?: string;
}

// Chapter metadata mapping for all 26 routes
export const ROUTE_CHAPTER_MAP: Record<string, string> = {
  "/admin": "Ca trực",
  "/admin/dashboard": "Ca trực",
  "/admin/vehicles": "Đội xe",
  "/admin/vehicles/new": "Đội xe",
  "/admin/vehicles/edit": "Đội xe",
  "/admin/vehicle-types": "Đội xe",
  "/admin/rentals": "Vận hành",
  "/admin/inspections": "Vận hành",
  "/admin/maintenance": "Vận hành",
  "/admin/dispatch": "Điều phối",
  "/admin/drivers/schedule": "Điều phối",
  "/admin/reports": "Chăm sóc & Sự cố",
  "/admin/reports/detail": "Chăm sóc & Sự cố",
  "/admin/reviews": "Chăm sóc & Sự cố",
  "/admin/reviews/detail": "Chăm sóc & Sự cố",
  "/admin/policies": "Chính sách",
  "/admin/subscription-plans": "Chính sách",
  "/admin/users": "Tổ chức",
  "/admin/users/detail": "Tổ chức",
  "/admin/staffs": "Tổ chức",
  "/admin/staffs/new": "Tổ chức",
  "/admin/staffs/detail": "Tổ chức",
  "/admin/departments": "Tổ chức",
  "/admin/facilities": "Tổ chức",
  "/admin/roles": "Tổ chức",
  "/admin/profile": "Cá nhân",
};

const RECENT_ROUTES_STORAGE_KEY = "thong_dong_admin_recent_routes";

function getRecentRouteHrefs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_ROUTES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentRouteHref(href: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentRouteHrefs().filter((h) => h !== href);
    const updated = [href, ...existing].slice(0, 5);
    localStorage.setItem(RECENT_ROUTES_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Safe fallback if localStorage is disabled or restricted
  }
}

export function TransitDeskRouteIndex({
  isOpen,
  onClose,
  userRoles = [],
}: TransitDeskRouteIndexProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Filter routes based on RBAC permissions
  const permittedRoutes: RouteEntry[] = useMemo(() => {
    return ADMIN_NAV_ITEMS.filter((item: NavItem) => {
      if (!item.roles || item.roles.length === 0) return true;
      return hasAnyRole(userRoles, item.roles);
    }).map((item) => ({
      chapter: ROUTE_CHAPTER_MAP[item.href] || "Hệ thống",
      href: item.href,
      label: item.label,
      description: item.description,
    }));
  }, [userRoles]);

  // Recent routes filtered by current user permissions (P2-02)
  const recentRoutes = useMemo<RouteEntry[]>(() => {
    if (!isOpen) return [];
    const hrefs = getRecentRouteHrefs();
    return hrefs
      .map((h) => permittedRoutes.find((r) => r.href === h))
      .filter((r): r is RouteEntry => r != null);
  }, [permittedRoutes, isOpen]);

  // Filter by query
  const filteredRoutes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permittedRoutes;
    return permittedRoutes.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.href.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q)
    );
  }, [permittedRoutes, query]);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (isOpen && event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Manage focus when opening / closing (P1-04)
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap on Tab within modal dialog (P1-04)
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  };

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredRoutes.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? filteredRoutes.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && filteredRoutes[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredRoutes[selectedIndex].href);
    }
  };

  const handleSelect = (href: string) => {
    saveRecentRouteHref(href);
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-scrim p-4 pt-16 sm:p-6 sm:pt-24"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="routeIndexTitle"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-td-rule bg-td-paper shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-td-rule bg-td-white px-5 py-3.5">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-td-muted">
              WAYFINDING · ROUTE ATLAS
            </span>
            <h2 id="routeIndexTitle" className="text-lg font-bold text-td-ink">
              Tìm chức năng vận hành
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng tìm kiếm"
            className="rounded p-1 text-td-muted hover:bg-td-chalk hover:text-td-ink cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative border-b border-td-rule bg-td-white px-5 py-3">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-td-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Gõ tên nghiệp vụ, nhóm hoặc đường dẫn (ví dụ: xe, sự cố, /admin/rentals)..."
            aria-label="Tìm kiếm route"
            className="w-full bg-transparent pl-8 pr-4 text-sm font-medium text-td-ink placeholder-td-muted outline-none"
          />
        </div>

        {/* Recent routes strip (P2-02: displayed when search is empty) */}
        {!query.trim() && recentRoutes.length > 0 && (
          <div className="border-b border-td-rule bg-td-white/60 px-5 py-2">
            <span className="font-mono text-[10px] uppercase font-bold text-td-muted block mb-1">
              GẦN ĐÂY / RECENT
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recentRoutes.map((r) => (
                <button
                  key={`recent-${r.href}`}
                  type="button"
                  onClick={() => handleSelect(r.href)}
                  className="rounded border border-td-rule bg-td-paper px-2 py-0.5 font-mono text-[11px] text-td-ink hover:border-td-ink transition-colors cursor-pointer"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredRoutes.length === 0 ? (
            <div className="py-8 text-center font-mono text-xs text-td-muted">
              Không tìm thấy chức năng được phân quyền phù hợp.
            </div>
          ) : (
            filteredRoutes.map((route, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={route.href}
                  type="button"
                  onClick={() => handleSelect(route.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between gap-4 rounded px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    isSelected ? "bg-td-chalk text-td-ink" : "text-td-ink hover:bg-td-chalk/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 font-mono text-[11px] font-semibold uppercase text-td-muted">
                      {route.chapter}
                    </span>
                    <span className="font-semibold text-sm truncate">
                      {route.label}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-td-muted">
                    {route.href}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-td-rule bg-td-white px-5 py-2.5 font-mono text-[11px] text-td-muted">
          <span>{filteredRoutes.length} chức năng hợp lệ theo quyền tài khoản</span>
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

export default TransitDeskRouteIndex;
