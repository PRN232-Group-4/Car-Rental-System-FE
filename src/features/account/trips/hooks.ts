import { useSyncExternalStore } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyTrips,
  fetchMyTripDetail,
  fetchCancellationPreview,
  cancelTrip,
} from "./api";
import type { TripTab, CancelTripInput } from "./types";

export const TRIP_KEYS = {
  all: ["my-trips"] as const,
  list: (tab: TripTab, page: number) => ["my-trips", "list", { tab, page }] as const,
  detail: (id: number) => ["my-trips", "detail", id] as const,
  cancellationPreview: (id: number) => ["my-trips", "cancel-preview", id] as const,
};

export function useMyTrips({
  tab = "upcoming",
  page = 1,
  pageSize = 12,
}: {
  tab: TripTab;
  page?: number;
  pageSize?: number;
}) {
  const isAutoRefetchTab = tab === "ongoing" || tab === "upcoming";

  return useQuery({
    queryKey: TRIP_KEYS.list(tab, page),
    queryFn: () => fetchMyTrips(tab, page, pageSize),
    staleTime: 15 * 1000,
    refetchInterval: isAutoRefetchTab ? 30 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useMyTrip(id: number) {
  return useQuery({
    queryKey: TRIP_KEYS.detail(id),
    queryFn: () => fetchMyTripDetail(id),
    staleTime: 10 * 1000,
    enabled: Boolean(id && id > 0),
  });
}

export function useCancellationPreview(id: number, enabled = true) {
  return useQuery({
    queryKey: TRIP_KEYS.cancellationPreview(id),
    queryFn: () => fetchCancellationPreview(id),
    staleTime: 0, // Luôn lấy thông tin mới nhất
    enabled: Boolean(id && id > 0 && enabled),
  });
}

export function useCancelTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CancelTripInput) => cancelTrip(input),
    onSuccess: (updatedTrip) => {
      queryClient.invalidateQueries({ queryKey: TRIP_KEYS.all });
      queryClient.setQueryData(TRIP_KEYS.detail(updatedTrip.id), updatedTrip);
    },
  });
}

// Global clock store ổn định cho useSyncExternalStore
let cachedNow = typeof window !== "undefined" ? Date.now() : 0;
const subscribers = new Set<() => void>();
let timerId: ReturnType<typeof setInterval> | null = null;

function subscribe(callback: () => void) {
  subscribers.add(callback);
  if (typeof window !== "undefined" && timerId === null) {
    cachedNow = Date.now();
    timerId = setInterval(() => {
      cachedNow = Date.now();
      subscribers.forEach((cb) => cb());
    }, 60_000);
  }
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  };
}

function getSnapshot(): number {
  return cachedNow;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Hook tick thời gian định kỳ (mỗi 60s) để đếm ngược tới giờ trả xe
 * sử dụng useSyncExternalStore với cached snapshot ổn định.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Tính toán thời gian còn lại (hoặc quá giờ) so với mốc end time
 */
export function getTripRemainingTime(
  endUtcIso: string,
  nowTimestamp: number
): {
  isOverdue: boolean;
  hours: number;
  minutes: number;
  displayText: string;
} {
  const effectiveNow = nowTimestamp > 0 ? nowTimestamp : Date.now();
  const targetTime = new Date(endUtcIso).getTime();
  const diffMs = targetTime - effectiveNow;

  if (diffMs <= 0) {
    const overdueMs = Math.abs(diffMs);
    const overdueHours = Math.floor(overdueMs / (3600 * 1000));
    const overdueMinutes = Math.floor((overdueMs % (3600 * 1000)) / (60 * 1000));
    return {
      isOverdue: true,
      hours: overdueHours,
      minutes: overdueMinutes,
      displayText:
        overdueHours > 0
          ? `Đã quá giờ trả ${overdueHours} giờ ${overdueMinutes} phút`
          : `Đã quá giờ trả ${overdueMinutes} phút`,
    };
  }

  const remainingHours = Math.floor(diffMs / (3600 * 1000));
  const remainingMinutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

  let displayText = "";
  if (remainingHours > 24) {
    const days = Math.floor(remainingHours / 24);
    const hours = remainingHours % 24;
    displayText = `Còn ${days} ngày ${hours} giờ`;
  } else if (remainingHours > 0) {
    displayText = `Còn ${remainingHours} giờ ${remainingMinutes} phút`;
  } else {
    displayText = `Còn ${remainingMinutes} phút`;
  }

  return {
    isOverdue: false,
    hours: remainingHours,
    minutes: remainingMinutes,
    displayText,
  };
}
