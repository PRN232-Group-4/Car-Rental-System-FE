"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export { useRouter as useNavigationRouter } from "next/navigation";

// A tiny observer has its own Suspense boundary so static pages stay prerenderable.
function RouteCommitObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        const target =
          (document.getElementById("main-content") as HTMLElement | null) ||
          (document.querySelector("main") as HTMLElement | null) ||
          (document.querySelector("h1") as HTMLElement | null);
        if (target && typeof target.focus === "function") {
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
            target.style.outline = "none";
          }
          target.focus({ preventScroll: true });
        }
      });
    }
  }, [pathname, searchParams]);
  return null;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <RouteCommitObserver />
      </Suspense>
      {children}
    </>
  );
}
