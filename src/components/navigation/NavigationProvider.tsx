"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageLoading } from "./PageLoading";
import { isPageNavigation } from "./navigation-target";

type NavigationControls = {
  begin: (href?: string) => void;
  cancel: () => void;
};

const NavigationContext = createContext<NavigationControls>({
  begin: () => {},
  cancel: () => {},
});

// A tiny observer has its own Suspense boundary so static pages stay prerenderable.
function RouteCommitObserver({ onCommit }: { onCommit: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    onCommit();
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const target =
          (document.getElementById("main-content") as HTMLElement | null) ||
          (document.querySelector("main") as HTMLElement | null) ||
          (document.querySelector("h1") as HTMLElement | null);
        if (target && typeof target.focus === "function") {
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
          }
          target.focus({ preventScroll: true });
        }
      });
    }
  }, [pathname, searchParams, onCommit]);
  return null;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const startedAt = useRef<number | null>(null);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const committedHref = useRef("");

  const clearTimers = useCallback(() => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
  }, []);

  const cancel = useCallback(() => {
    clearTimers();
    startedAt.current = null;
    setLoading(false);
  }, [clearTimers]);

  const begin = useCallback((href?: string) => {
    if (href && !isPageNavigation(href, window.location.href)) return;
    clearTimers();
    startedAt.current = Date.now();
    setLoading(true);
    // Failed/cancelled navigations must never leave the page behind a loader.
    safetyTimer.current = setTimeout(cancel, 15_000);
  }, [cancel, clearTimers]);

  const onCommit = useCallback(() => {
    committedHref.current = window.location.href;
    if (startedAt.current === null) return;
    // Keep even a prefetched navigation visible briefly without delaying routing.
    const remaining = Math.max(0, 220 - (Date.now() - startedAt.current));
    if (finishTimer.current) clearTimeout(finishTimer.current);
    finishTimer.current = setTimeout(cancel, remaining);
  }, [cancel]);

  useEffect(() => {
    committedHref.current = window.location.href;
    const onPopState = () => {
      if (isPageNavigation(window.location.href, committedHref.current)) begin();
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", cancel);
    window.addEventListener("pagehide", cancel);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", cancel);
      window.removeEventListener("pagehide", cancel);
      clearTimers();
    };
  }, [begin, cancel, clearTimers]);

  const controls = useMemo(() => ({ begin, cancel }), [begin, cancel]);
  return (
    <NavigationContext.Provider value={controls}>
      <Suspense fallback={null}>
        <RouteCommitObserver onCommit={onCommit} />
      </Suspense>
      {children}
      {loading && <PageLoading overlay />}
    </NavigationContext.Provider>
  );
}

export function useNavigationLoading() {
  return useContext(NavigationContext);
}

/** Preserve the Next router API while giving imperative navigations the same UI. */
export function useNavigationRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  const { begin, cancel } = useNavigationLoading();
  return useMemo(() => {
    const navigate = (href: string, action: () => void) => {
      begin(href);
      try {
        action();
      } catch (error) {
        cancel();
        throw error;
      }
    };
    return {
      ...router,
      push: (href, options) => navigate(href, () => router.push(href, options)),
      replace: (href, options) => navigate(href, () => router.replace(href, options)),
      // popstate starts the loader only when the history entry actually changes.
      back: () => router.back(),
      forward: () => router.forward(),
    };
  }, [router, begin, cancel]);
}
