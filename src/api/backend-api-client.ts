import { ApiClient } from "./api-client";

// Both next dev and the deployed Worker proxy /api to the live backend.
// Keeping the same origin preserves the logged-in session cookie.
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export const backendApiClient = new ApiClient({
  baseUrl,
});
