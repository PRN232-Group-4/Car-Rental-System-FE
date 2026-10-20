import { ApiClient } from "./api-client";

/**
 * Pre-configured application API client.
 * Luôn gọi backend REST thật — không có chế độ mock/dữ liệu mẫu trong app.
 */
export const defaultApiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
});

export const apiClient = defaultApiClient;
export default defaultApiClient;
