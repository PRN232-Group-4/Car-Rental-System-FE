import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useSession } from "@/features/auth/AuthContext";
import * as authApi from "@/features/auth/api";
import type { AuthUser } from "@/features/auth/types";

vi.mock("@/features/auth/api");

const mockUser: AuthUser = {
  email: "test@example.com",
  fullName: "Nguyen Test",
  roles: ["Customer"],
};

describe("useSession & AuthProvider (Memory-Only & Multi-Tab Synchronization)", () => {
  let queryClient: QueryClient;
  let broadcastChannelInstances: MockBroadcastChannel[] = [];

  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
      broadcastChannelInstances.push(this);
    }

    postMessage(data: unknown) {
      // Simulate dispatching to all other channels with the same name
      broadcastChannelInstances.forEach((ch) => {
        if (ch !== this && ch.name === this.name && ch.onmessage) {
          ch.onmessage(new MessageEvent("message", { data }));
        }
      });
    }

    close() {
      broadcastChannelInstances = broadcastChannelInstances.filter((ch) => ch !== this);
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    broadcastChannelInstances = [];
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: Infinity,
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createWrapper = () => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      );
    };
  };

  it("initializes with loading status and becomes authenticated when profile succeeds", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.hasRole("Customer")).toBe(true);
    expect(result.current.hasRole("Admin")).toBe(false);
  });

  it("transitions to anonymous when getProfile returns null (e.g. 401 guest)", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(null);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toBe("anonymous");
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("syncs logout across tabs via BroadcastChannel('vrs-auth')", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    // Simulate Tab 2 broadcasting a logout message
    const remoteTab = new MockBroadcastChannel("vrs-auth");
    act(() => {
      remoteTab.postMessage({ type: "logout" });
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
  });

  it("revalidates session when restored from bfcache (pageshow event with persisted=true)", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    // Now profile changes to null on next fetch
    vi.mocked(authApi.getProfile).mockResolvedValue(null);

    // Simulate browser bfcache pageshow restoration
    act(() => {
      const pageShowEvent = new Event("pageshow") as Event & { persisted: boolean };
      pageShowEvent.persisted = true;
      window.dispatchEvent(pageShowEvent);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
  });

  it("clears session in memory when global auth:unauthorized event is dispatched", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    act(() => {
      window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { timestamp: Date.now() } }));
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
  });

  it("handles login and logout correctly", async () => {
    vi.mocked(authApi.getProfile).mockResolvedValue(null);
    vi.mocked(authApi.loginUser).mockResolvedValue(mockUser);
    vi.mocked(authApi.logoutUser).mockResolvedValue();

    const { result } = renderHook(() => useSession(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
    });

    // Execute login
    vi.mocked(authApi.getProfile).mockResolvedValue(mockUser);
    await act(async () => {
      await result.current.login({ email: "test@example.com", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
      expect(result.current.user).toEqual(mockUser);
    });

    // Execute logout
    vi.mocked(authApi.getProfile).mockResolvedValue(null);
    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("anonymous");
      expect(result.current.user).toBeNull();
    });
    expect(authApi.logoutUser).toHaveBeenCalledTimes(1);
  });
});
