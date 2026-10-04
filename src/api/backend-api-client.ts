import { ApiClient } from "./api-client";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "/api"
    : "https://car-rental-system-be-production.up.railway.app/api");

export const backendApiClient = new ApiClient({
  baseUrl,
});
