"use client";

import { useEffect, useSyncExternalStore } from "react";

export type PortalTheme = "light" | "dark";

const storageKey = "vrs-admin-theme";
const themeEvent = "vrs-admin-theme-change";
let sessionTheme: PortalTheme | null = null;

function readTheme(): PortalTheme {
  if (sessionTheme) return sessionTheme;
  if (typeof document !== "undefined") {
    const dt = document.documentElement.dataset.adminTheme || document.documentElement.dataset.theme;
    if (dt === "light" || dt === "dark") return dt;
  }
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(storageKey) || window.localStorage.getItem("theme");
  } catch {
    // A blocked storage area still allows theme changes for this session.
  }
  if (saved === "light" || saved === "dark") return saved;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onThemeChanged = () => {
    sessionTheme = null;
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === "theme" || event.key === null) {
      sessionTheme = null;
      onChange();
    }
  };
  window.addEventListener(themeEvent, onThemeChanged);
  window.addEventListener("thong_dong_theme_change", onThemeChanged);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onThemeChanged);

  let observer: MutationObserver | null = null;
  if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "attributes" &&
          (m.attributeName === "data-admin-theme" || m.attributeName === "data-theme")
        ) {
          sessionTheme = null;
          onChange();
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-admin-theme", "data-theme"],
    });
  }

  return () => {
    window.removeEventListener(themeEvent, onThemeChanged);
    window.removeEventListener("thong_dong_theme_change", onThemeChanged);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onThemeChanged);
    observer?.disconnect();
  };
}

/**
 * Paco Coursey / Next-Themes zero-flicker pattern:
 * Vô hiệu hóa tạm thời tất cả transition CSS trong khi thay đổi theme attribute để triệt tiêu
 * hoàn toàn hiện tượng chớp giật (cascading transition repaints) và layout shifts.
 */
export function disableTransitionsTemporarily() {
  if (typeof document === "undefined") return;
  let style = document.getElementById("disable-theme-transitions") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "disable-theme-transitions";
    style.textContent = "*, *::before, *::after { transition: none !important; }";
    document.head.appendChild(style);
  }
  // Ép reflow đồng bộ
  void window.getComputedStyle(document.body).opacity;

  setTimeout(() => {
    const existing = document.getElementById("disable-theme-transitions");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }, 60);
}

/**
 * Theme dùng chung cho toàn bộ website (Marketing, Khách hàng, Điều hành, Admin):
 * lưu `light|dark` ở localStorage, áp lên `documentElement[data-theme]` và `documentElement[data-admin-theme]`
 * để token màu đồng bộ tức thì, mượt mà và không giật chớp.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as const);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.adminTheme !== theme) {
      root.dataset.adminTheme = theme;
    }
    if (root.dataset.theme !== theme) {
      root.dataset.theme = theme;
    }
    return () => {
      root.removeAttribute("data-admin-theme");
    };
  }, [theme]);

  const setTheme = (next: PortalTheme) => {
    sessionTheme = next;
    try {
      window.localStorage.setItem(storageKey, next);
      window.localStorage.setItem("theme", next);
    } catch {
      // Keep the preference in memory if persistence is unavailable.
    }
    if (typeof document !== "undefined") {
      disableTransitionsTemporarily();
      document.documentElement.dataset.adminTheme = next;
      document.documentElement.dataset.theme = next;
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      void window.getComputedStyle(document.body).opacity;
    }
    window.dispatchEvent(new Event(themeEvent));
    window.dispatchEvent(new Event("thong_dong_theme_change"));
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
