"use client";

import { useEffect, useSyncExternalStore } from "react";

type AdminTheme = "light" | "dark";
const storageKey = "vrs-admin-theme";
const themeEvent = "vrs-admin-theme-change";
let sessionTheme: AdminTheme | null = null;

function readTheme(): AdminTheme {
  if (sessionTheme) return sessionTheme;
  if (typeof document !== "undefined" && document.documentElement.dataset.adminTheme) {
    const dt = document.documentElement.dataset.adminTheme;
    if (dt === "light" || dt === "dark") return dt;
  }
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(storageKey);
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
    if (event.key === storageKey || event.key === null) {
      sessionTheme = null;
      onChange();
    }
  };
  window.addEventListener(themeEvent, onThemeChanged);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onThemeChanged);

  let observer: MutationObserver | null = null;
  if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-admin-theme") {
          sessionTheme = null;
          onChange();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-admin-theme"] });
  }

  return () => {
    window.removeEventListener(themeEvent, onThemeChanged);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onThemeChanged);
    observer?.disconnect();
  };
}

export function useAdminTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as const);

  useEffect(() => {
    // The root also covers dialogs and toasts rendered outside the shell.
    const root = document.documentElement;
    if (root.dataset.adminTheme !== theme) {
      root.dataset.adminTheme = theme;
    }
  }, [theme]);

  const toggleTheme = () => {
    sessionTheme = theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(storageKey, sessionTheme);
    } catch {
      // Keep the preference in memory if persistence is unavailable.
    }
    window.dispatchEvent(new Event(themeEvent));
  };

  return { theme, toggleTheme };
}
