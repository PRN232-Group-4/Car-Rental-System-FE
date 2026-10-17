"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchReviews,
  fetchReviewDetail,
  fetchRatingSummary,
  hideReview,
  unhideReview,
  replyReview,
} from "./api";
import type { ReviewFilterParams } from "./types";

export const reviewKeys = {
  all: ["admin", "reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (params: ReviewFilterParams) => [...reviewKeys.lists(), params] as const,
  details: () => [...reviewKeys.all, "detail"] as const,
  detail: (id: number | null) => [...reviewKeys.details(), id] as const,
  summary: (staffId?: number) => ["rating-summary", staffId ?? "all"] as const,
};

export function useReviews(params: ReviewFilterParams = {}) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: () => fetchReviews(params),
  });
}

export function useReview(id: number | null) {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => {
      if (!id) throw new Error("reviewId is required");
      return fetchReviewDetail(id);
    },
    enabled: typeof id === "number" && id > 0,
  });
}

export function useRatingSummary(staffId?: number) {
  return useQuery({
    queryKey: reviewKeys.summary(staffId),
    queryFn: () => fetchRatingSummary(staffId),
  });
}

export function useHideReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: number; reason: string }) => hideReview(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ["rating-summary"] });
      if (data.staff?.id) {
        queryClient.invalidateQueries({ queryKey: ["staff", data.staff.id] });
      }
    },
  });
}

export function useUnhideReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => unhideReview(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ["rating-summary"] });
      if (data.staff?.id) {
        queryClient.invalidateQueries({ queryKey: ["staff", data.staff.id] });
      }
    },
  });
}

export function useReplyReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: number; replyText: string }) => replyReview(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(data.id) });
    },
  });
}
