import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/api/api-client";
import { getProfile } from "./api";
import type { AuthUser } from "./types";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("@/api/default-api-client", () => ({
  defaultApiClient: { get: mocks.get, post: vi.fn() },
}));

const testUser: AuthUser = {
  email: "user@example.com",
  fullName: "Nguyen Van A",
  roles: ["Customer"],
};

function installLocalStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void store.set(key, value)),
    removeItem: vi.fn((key: string) => void store.delete(key)),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
  return { store, storage };
}

describe("getProfile in-memory handling & Zero PII in localStorage", () => {
  let localStorageMock: ReturnType<typeof installLocalStorage>;

  beforeEach(() => {
    mocks.get.mockReset();
    localStorageMock = installLocalStorage();
  });

  it("returns user profile on HTTP 200 without writing to localStorage (Zero PII)", async () => {
    mocks.get.mockResolvedValue(testUser);

    const result = await getProfile();
    expect(result).toEqual(testUser);
    // Crucial: No PII stored in localStorage
    expect(localStorageMock.storage.setItem).not.toHaveBeenCalled();
    expect(localStorageMock.store.size).toBe(0);
  });

  it("returns null on HTTP 401 (guest/anonymous) without throwing error", async () => {
    mocks.get.mockRejectedValue(
      new ApiClientError(401, "Unauthorized", { detail: "Phiên chưa đăng nhập hoặc đã hết hạn" }),
    );

    const result = await getProfile();
    expect(result).toBeNull();
    expect(localStorageMock.storage.setItem).not.toHaveBeenCalled();
  });

  it("throws error on network/server errors so TanStack Query handles retry", async () => {
    mocks.get.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(getProfile()).rejects.toThrow("Failed to fetch");
    expect(localStorageMock.storage.setItem).not.toHaveBeenCalled();
  });
});
