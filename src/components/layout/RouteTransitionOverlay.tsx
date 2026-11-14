"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/motion/register";
import {
  endRouteTransition,
  getRouteTransitionState,
  subscribeRouteTransition,
  type RouteTransitionItem,
} from "@/lib/route-transition";

/** Chờ trang mới commit xong (paint đầu tiên) trước khi cho phép tắt loader. */
const PAINT_GRACE_MS = 220;
/** Chốt an toàn: trang đích quên báo sẵn sàng thì loader cũng không treo quá lâu. */
const MAX_HOLD_MS = 12000;
/**
 * Route có nội dung nặng: overlay tự giữ, chỉ nhả khi chính trang gọi endRouteTransition().
 * Không dựa vào việc trang kịp gọi holdRouteTransition() lúc mount (trang có thể nằm sau Suspense).
 */
const HOLD_ROUTE_PREFIXES = ["/find", "/subscriptions", "/inspection"];

export function RouteTransitionOverlay() {
  const state = useSyncExternalStore(
    subscribeRouteTransition,
    getRouteTransitionState,
    getRouteTransitionState,
  );
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // Giữ lại item sau khi store clear để còn chạy animation đóng.
  const [displayed, setDisplayed] = useState<RouteTransitionItem | null>(state.item);
  if (state.item && state.item !== displayed) setDisplayed(state.item);

  // Mở: reveal từ dưới lên + thanh tiến trình chạy.
  useEffect(() => {
    if (!state.item || !overlayRef.current) return;
    const tl = gsap.timeline();
    // Lần mở trước đã fade về autoAlpha 0 khi đóng.
    tl.set(overlayRef.current, { autoAlpha: 1 }, 0);
    tl.fromTo(
      overlayRef.current,
      { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" },
      { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.42, ease: "expo.out" },
      0,
    );
    if (barRef.current) {
      tl.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: "power1.inOut" }, 0.12);
    }
    return () => {
      tl.kill();
    };
  }, [state.item]);

  // Đóng: chỉ khi trang đích đã commit và không còn giữ loader.
  useEffect(() => {
    if (state.item || !displayed) return;
    const el = overlayRef.current;
    if (!el) {
      const id = window.setTimeout(() => setDisplayed(null), 0);
      return () => window.clearTimeout(id);
    }
    const tl = gsap.timeline({ onComplete: () => setDisplayed(null) });
    tl.to(el, { autoAlpha: 0, duration: 0.24, ease: "power2.in" }, 0);
    return () => {
      tl.kill();
    };
  }, [state.item, displayed]);

  // Nhả loader: sau khi pathname đổi, nếu trang đích không giữ thì tắt sau một nhịp paint.
  useEffect(() => {
    if (!state.item || pathname !== state.item.href) return;
    // Bấm lại chính route đang đứng: không có trang mới nào sẽ báo sẵn sàng.
    const sameRoute = state.fromPath === state.item.href;
    const expectHold = !sameRoute && HOLD_ROUTE_PREFIXES.some((prefix) => state.item!.href.startsWith(prefix));
    const grace = window.setTimeout(() => {
      if (!expectHold && !getRouteTransitionState().hold) endRouteTransition();
    }, PAINT_GRACE_MS);
    const cap = window.setTimeout(endRouteTransition, MAX_HOLD_MS);
    return () => {
      window.clearTimeout(grace);
      window.clearTimeout(cap);
    };
  }, [state.item, state.fromPath, state.hold, pathname]);
  if (!displayed) return null;

  return (
    <div
      ref={overlayRef}
      aria-live="polite"
      aria-busy="true"
      style={{ zIndex: 100 }}
      className="fixed inset-0 h-[100dvh] w-full bg-bone-100 p-8 text-ink-950 sm:p-16 flex flex-col justify-between will-change-transform"
    >
      <div className="flex items-center justify-between border-b-2 border-ink-950 pb-4 text-xs uppercase tracking-[0.28em] font-sans font-bold">
        <span>THONG DONG // CHUYỂN TIẾP PHÂN KHU</span>
        <span className="text-sun-600">{displayed.tag}</span>
      </div>

      <div className="my-auto max-w-4xl space-y-6">
        <span
          style={{
            fontFamily: "var(--font-archivo, sans-serif)",
            fontSize: "clamp(4rem, 10vw, 10rem)",
            lineHeight: 0.85,
            fontVariationSettings: "'wdth' 66",
          }}
          className="block font-black text-sun-600"
        >
          {displayed.index}
        </span>
        <div
          style={{
            fontFamily: "var(--font-archivo, sans-serif)",
            fontSize: "clamp(2.5rem, 6vw, 6.5rem)",
            lineHeight: 0.95,
            fontVariationSettings: "'wdth' 108",
          }}
          className="font-black uppercase tracking-tight text-ink-950"
        >
          {displayed.label}
        </div>
        <p className="font-sans text-base text-ink-950/80 sm:text-lg">{displayed.sub}</p>

        <div className="mt-8 h-2 w-full max-w-xl overflow-hidden bg-ink-950/15">
          <div
            ref={barRef}
            style={{ transformOrigin: "left center" }}
            className="h-full w-full bg-sun-600 will-change-transform"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t-2 border-ink-950 pt-4 text-[11px] uppercase tracking-[0.24em] font-sans font-bold">
        <span>ĐANG KHỞI TẠO KHÔNG GIAN...</span>
        <span>{displayed.href}</span>
      </div>
    </div>
  );
}

export default RouteTransitionOverlay;
