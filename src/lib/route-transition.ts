/**
 * Cầu nối giữa menu chuyển trang (MenuOverlay) và overlay loader toàn cục.
 * Overlay nằm ở root layout nên không bị unmount khi đổi route; nhờ vậy nó có thể
 * giữ nguyên cho tới khi trang đích báo "nội dung đã sẵn sàng" (holdRouteTransition).
 */

export interface RouteTransitionItem {
  index: string;
  label: string;
  sub: string;
  tag: string;
  href: string;
}

interface RouteTransitionState {
  item: RouteTransitionItem | null;
  /** pathname lúc bấm menu — để biết người dùng có bấm lại chính route đang đứng không. */
  fromPath: string | null;
  /** Trang đích đang giữ loader (vì còn dữ liệu/model đang tải). */
  hold: boolean;
}

let state: RouteTransitionState = { item: null, fromPath: null, hold: false };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeRouteTransition(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRouteTransitionState(): RouteTransitionState {
  return state;
}

export function beginRouteTransition(item: RouteTransitionItem, fromPath: string) {
  state = { item, fromPath, hold: false };
  emit();
}

/** Trang đích gọi ngay khi mount nếu còn dữ liệu nặng phải tải. */
export function holdRouteTransition() {
  if (!state.item || state.hold) return;
  state = { ...state, hold: true };
  emit();
}

export function isRouteTransitionPending() {
  return state.item !== null;
}

/** Trang đích gọi sau khi dữ liệu/model đã hiển thị; no-op nếu không có chuyển trang. */
export function endRouteTransition() {
  if (!state.item) return;
  state = { item: null, fromPath: null, hold: false };
  emit();
}
