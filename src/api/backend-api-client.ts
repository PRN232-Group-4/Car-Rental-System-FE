import { ApiClient } from "./api-client";

export const backendApiClient = new ApiClient({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://car-rental-system-be-production.up.railway.app/api",
});
