/** Khoá localStorage lưu user đã đăng nhập. Khai báo ở đây (module không import gì)
 *  để cả auth/api.ts và token-refresh dùng chung mà không tạo vòng import. */
export const AUTH_USER_STORAGE_KEY = "thongdong_auth_user";

let refreshPromise: Promise<boolean> | null = null;

export async function refreshSessionToken(fetchFn: typeof fetch, baseUrl: string): Promise<boolean> {
  // If a refresh is already in flight, reuse the promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const cleanBase = baseUrl.replace(/\/+$/, "");
      const refreshUrl = cleanBase ? `${cleanBase}/auth/refresh` : "/api/auth/refresh";

      const res = await fetchFn(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function handleAuthFailure(nextPath?: string) {
  if (typeof window !== "undefined") {
    // A 401 for a guest (no cached user) just means "not logged in" — never
    // bounce a public page to /login. Only force re-login when a previously
    // authenticated session actually died.
    let hadUser = false;
    try {
      hadUser = !!localStorage.getItem(AUTH_USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (!hadUser) return;

    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/login")) {
      const target = nextPath || currentPath + window.location.search;
      // Full reload là chủ đích: xoá sạch state auth còn sót trong RAM sau khi phiên chết.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${encodeURIComponent(target)}`;
    }
  }
}
