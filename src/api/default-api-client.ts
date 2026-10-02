import { ApiClient } from "./api-client";
import { mockFetch } from "./mock";

const isMockMode =
  process.env.NEXT_PUBLIC_USE_MOCK !== "false" || !process.env.NEXT_PUBLIC_API_URL;

/**
 * Pre-configured application API client.
 * Seamlessly routes to in-memory mock handlers when in mock mode,
 * or forwards to the backend REST API when configured.
 */
export const defaultApiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  customFetch: isMockMode ? mockFetch : undefined,
});

export const apiClient = defaultApiClient;
export default defaultApiClient;
