import { QueryClient, isServer } from "@tanstack/react-query";
import { ApiProblemError } from "@/api/api-client";

/**
 * Tạo mới một QueryClient với cấu hình chuẩn của FE-FOUNDATION mục 5:
 * - staleTime: 30s
 * - gcTime: 5m (300_000ms)
 * - retry: Chỉ retry khi lỗi hạ tầng hoặc lỗi mạng (dựa trên error.retryable)
 * - refetchOnWindowFocus: false (tránh tự động fetch lại làm gián đoạn nhập liệu form admin)
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (failureCount >= 2) return false;
          if (error instanceof ApiProblemError) {
            return error.retryable;
          }
          return true; // Lỗi mạng fetch failed hoặc chưa xác định
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Lấy QueryClient singleton phía trình duyệt, hoặc tạo instance mới trên server
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}
