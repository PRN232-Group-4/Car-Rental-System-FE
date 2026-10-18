"use client";

import React from "react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { AuthProvider } from "@/features/auth";
import { Toaster } from "@/components/ui/Toaster";

export interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root Client Providers theo FE-FOUNDATION mục 5:
 * - QueryClientProvider + ReactQueryDevtools
 * - NavigationProvider (loading router state)
 * - AuthProvider (phiên đăng nhập và RBAC)
 * - Toaster (thông báo Toast từ sonner chuẩn token v3.1)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <NavigationProvider>
        <AuthProvider>{children}</AuthProvider>
      </NavigationProvider>
      <Toaster />
    </QueryProvider>
  );
}

export default Providers;
