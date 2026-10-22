import { afterEach, expect, it, vi } from "vitest";
import { apiServerInfo } from "./api-debug";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it("shows the actual upstream for same-origin API rewrites", () => {
  expect(apiServerInfo("/api/rentals?page=1", "http://localhost:3000", "https://backend.example")).toEqual({ requestOrigin: "http://localhost:3000", backendOrigin: "https://backend.example", via: "Next.js dev proxy /api" });
});

it("uses a direct API override instead of claiming it goes through the proxy", () => {
  expect(apiServerInfo("http://localhost:5000/api/rentals", "http://localhost:3000", "https://backend.example")).toEqual({ requestOrigin: "http://localhost:5000", backendOrigin: "http://localhost:5000", via: "direct" });
  expect(apiServerInfo("/other", "http://localhost:3000", "https://backend.example").via).toBe("direct");
});

it("logs a destination once and omits all credentials and request details", async () => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_DEV_API_PROXY_ORIGIN", "https://user:password@backend.example/private?secret=hidden");
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  const { logApiServer } = await import("./api-debug");
  logApiServer("/api/account/profile?token=private-token&email=person@example.com");
  logApiServer("/api/other");
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith("[API server]", expect.objectContaining({ backendOrigin: "https://backend.example", via: "Next.js dev proxy /api" }));
  for (const secret of ["password", "private-token", "person@example.com", "hidden", "/private"]) expect(JSON.stringify(log.mock.calls)).not.toContain(secret);
});

it.each(["production", "test"] as const)("does not log in %s", async mode => {
  vi.stubEnv("NODE_ENV", mode);
  const log = vi.spyOn(console, "info").mockImplementation(() => {});
  const { logApiServer } = await import("./api-debug");
  logApiServer("https://backend.example/api/profile");
  expect(log).not.toHaveBeenCalled();
});

it("ignores malformed diagnostics without throwing into the request flow", async () => {
  vi.stubEnv("NODE_ENV", "development");
  const { logApiServer } = await import("./api-debug");
  expect(() => logApiServer("http://[invalid")).not.toThrow();
});
