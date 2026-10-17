"use client";

import { useEffect, useSyncExternalStore } from "react";

type AdminTheme = "light" | "dark";
const storageKey = "vrs-admin-theme";
const themeEvent = "vrs-admin-theme-change";
let sessionTheme: AdminTheme | null = null;

function readTheme(): AdminTheme {
  if (sessionTheme) return sessionTheme;
  let saved: string | null = null;
  try {
    saved = window.localStorage.getItem(storageKey);
  } catch {
    // A blocked storage area still allows theme changes for this session.
  }
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      sessionTheme = null;
      onChange();
    }
  };
  window.addEventListener(themeEvent, onChange);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(themeEvent, onChange);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onChange);
  };
}

export function useAdminTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as const);

  useEffect(() => {
    // The root also covers dialogs and toasts rendered outside the shell.
    const root = document.documentElement;
    root.dataset.adminTheme = theme;
    return () => {
      delete root.dataset.adminTheme;
    };
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
