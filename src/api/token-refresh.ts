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
      hadUser = !!localStorage.getItem("thongdong_auth_user");
      localStorage.removeItem("thongdong_auth_user");
    } catch {
      // ignore
    }
    if (!hadUser) return;

    const currentPath = window.location.pathname;
    if (!currentPath.startsWith("/login")) {
      const target = nextPath || currentPath + window.location.search;
      window.location.href = `/login?next=${encodeURIComponent(target)}`;
    }
  }
}
