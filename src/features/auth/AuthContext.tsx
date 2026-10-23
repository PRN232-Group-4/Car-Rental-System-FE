"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthUser, LoginCredentials } from "./types";
import { Role } from "./roles";
import { hasRole as checkHasRole, hasAnyRole as checkHasAnyRole } from "./access";
import { loginUser, logoutUser, getProfile } from "./api";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export interface SessionContextType {
  user: AuthUser | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: readonly (Role | string)[]) => boolean;
  refreshProfile: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = "vrs-auth";

type AuthBroadcastMessage =
  | { type: "login" }
  | { type: "logout" }
  | { type: "refresh" };

function postBroadcastMessage(msg: AuthBroadcastMessage): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.postMessage(msg);
    channel.close();
  } catch {
    // Graceful fallback for non-supporting browsers or isolated contexts
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // 1. Quản lý trạng thái phiên 100% trong bộ nhớ (In-Memory) qua TanStack Query
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<AuthUser | null>({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const profile = await getProfile();
        return profile;
      } catch {
        // 401 hoặc lỗi mạng đều chuyển về trạng thái khách (anonymous/null)
        return null;
      }
    },
    staleTime: 60 * 1000, // 60 giây
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const currentUser = user ?? null;
  const status: AuthStatus = isLoading
    ? "loading"
    : currentUser
      ? "authenticated"
      : "anonymous";

  // 2. Đồng bộ hóa đa tab qua BroadcastChannel("vrs-auth")
  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<AuthBroadcastMessage>) => {
        const data = event.data;
        if (!data || typeof data.type !== "string") return;

        if (data.type === "logout") {
          queryClient.setQueryData(["session"], null);
        } else if (data.type === "login" || data.type === "refresh") {
          void queryClient.invalidateQueries({ queryKey: ["session"] });
        }
      };
    } catch {
      // Ignore
    }

    return () => {
      try {
        channel?.close();
      } catch {
        // Ignore
      }
    };
  }, [queryClient]);

  // 3. Tự động kiểm tra lại phiên khi phục hồi từ Back/Forward Cache (bfcache)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [queryClient]);

  // 4. Lắng nghe sự kiện 401 toàn cục từ api-client ("auth:unauthorized")
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUnauthorized = () => {
      queryClient.setQueryData(["session"], null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      const loggedUser = await loginUser(credentials);
      queryClient.setQueryData(["session"], loggedUser);
      postBroadcastMessage({ type: "login" });
      return loggedUser;
    },
    [queryClient],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutUser();
    } finally {
      queryClient.setQueryData(["session"], null);
      queryClient.removeQueries({ queryKey: ["session"] });
      postBroadcastMessage({ type: "logout" });
    }
  }, [queryClient]);

  const hasRole = useCallback(
    (role: string): boolean => {
      return checkHasRole(currentUser?.roles, role);
    },
    [currentUser?.roles],
  );

  const hasAnyRole = useCallback(
    (roles: readonly (Role | string)[]): boolean => {
      return checkHasAnyRole(currentUser?.roles, roles);
    },
    [currentUser?.roles],
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    await refetch();
    postBroadcastMessage({ type: "refresh" });
  }, [refetch]);

  const value = useMemo<SessionContextType>(
    () => ({
      user: currentUser,
      status,
      isLoading,
      isAuthenticated: status === "authenticated",
      login,
      logout,
      hasRole,
      hasAnyRole,
      refreshProfile,
    }),
    [currentUser, status, isLoading, login, logout, hasRole, hasAnyRole, refreshProfile],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

/** Hook hiện đại quản lý phiên theo FE-02 */
export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return context;
}

/** Hook an toàn khi component có thể chạy ngoài AuthProvider (test fixtures) */
export function useOptionalSession(): SessionContextType | null {
  return useContext(SessionContext) ?? null;
}

/** Hook tương thích ngược cho các component hiện có */
export function useAuth(): SessionContextType {
  return useSession();
}

export default AuthProvider;
