import { defaultApiClient } from "./default-api-client";

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  mode?: "live";
  timestamp: string;
  version?: string;
  service?: string;
}

/**
 * Checks backend health for the public status indicator.
 */
export async function checkHealth(): Promise<HealthStatus> {
  return defaultApiClient.get<HealthStatus>("health");
}
