import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/api/api-client";
import { AUTH_USER_STORAGE_KEY } from "@/api/token-refresh";
import { getProfile } from "./api";
import type { AuthUser } from "./types";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/api/default-api-client", () => ({
  defaultApiClient: { get: mocks.get, post: vi.fn() },
}));

const cachedUser: AuthUser = {
  email: "cached@example.com",
  fullName: "Cached User",
  roles: ["Customer"],
};

function installLocalStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
  // auth/api.ts đọc cả `window.localStorage` lẫn biến global `localStorage`.
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  return store;
}

describe("getProfile cache handling", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    mocks.get.mockReset();
    store = installLocalStorage();
  });

  it("caches the profile on success", async () => {
    mocks.get.mockResolvedValue(cachedUser);

    await expect(getProfile()).resolves.toEqual(cachedUser);
    expect(store.get(AUTH_USER_STORAGE_KEY)).toBe(JSON.stringify(cachedUser));
  });

  it("clears the cache on 401 (session thực sự chết)", async () => {
    store.set(AUTH_USER_STORAGE_KEY, JSON.stringify(cachedUser));
    mocks.get.mockRejectedValue(new ApiClientError(401, "Unauthorized", { detail: "hết hạn" }));

    await expect(getProfile()).resolves.toBeNull();
    expect(store.has(AUTH_USER_STORAGE_KEY)).toBe(false);
  });

  it("keeps the cache on network/offline errors", async () => {
    store.set(AUTH_USER_STORAGE_KEY, JSON.stringify(cachedUser));
    mocks.get.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(getProfile()).resolves.toEqual(cachedUser);
    expect(store.has(AUTH_USER_STORAGE_KEY)).toBe(true);
  });
});
