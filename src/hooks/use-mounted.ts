import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns true only on the client after hydration, false on the server (SSR).
 * Uses React's useSyncExternalStore to avoid hydration mismatch and cascading renders.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
