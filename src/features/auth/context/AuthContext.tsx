"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser, LoginCredentials } from "../types";
import { loginUser, logoutUser, getProfile, getCachedUser } from "../api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [isLoading, setIsLoading] = useState<boolean>(() => !getCachedUser());

  // Verify and refresh profile from backend or mock session on mount
  useEffect(() => {
    let isMounted = true;

    getProfile()
      .then((profile) => {
        if (!isMounted) return;
        if (profile) {
          setUser(profile);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        // In offline/mock fallback, retain cached user if any
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const loggedUser = await loginUser(credentials);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!user) return false;
      return user.roles.some((r) => r.toLowerCase() === role.toLowerCase());
    },
    [user]
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    const profile = await getProfile();
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
