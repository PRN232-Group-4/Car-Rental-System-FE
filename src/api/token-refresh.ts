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

export function handleAuthFailure(): void {
  // Trạng thái phiên được quản lý hoàn toàn trong bộ nhớ (In-Memory) qua TanStack Query.
  // Sự kiện "auth:unauthorized" đã được emitUnauthorizedEvent() trong api-client.ts phát có debounce.
  // Tuyệt đối không lưu trữ hoặc đọc PII từ localStorage.
}
