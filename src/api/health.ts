import { defaultApiClient } from "./default-api-client";

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  mode?: "mock" | "live";
  timestamp: string;
  version?: string;
  service?: string;
}

/**
 * Checks system operational status from either mock or real backend.
 */
export async function checkHealth(): Promise<HealthStatus> {
  return defaultApiClient.get<HealthStatus>("health");
}
