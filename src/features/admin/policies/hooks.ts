import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchVehicleTypes,
  fetchRentalPolicies,
  createRentalPolicy,
  fetchSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "./api";
import type { PolicyInput, PlanInput } from "./types";

export const POLICY_KEYS = {
  all: ["rental-policies"] as const,
  plans: ["subscription-plans"] as const,
  vehicleTypes: ["vehicle-types"] as const,
};

export function useVehicleTypes() {
  return useQuery({
    queryKey: POLICY_KEYS.vehicleTypes,
    queryFn: fetchVehicleTypes,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePolicies() {
  return useQuery({
    queryKey: POLICY_KEYS.all,
    queryFn: fetchRentalPolicies,
    staleTime: 60 * 1000,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PolicyInput) => createRentalPolicy(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_KEYS.all });
    },
  });
}

export function usePlans(includeAll = true) {
  return useQuery({
    queryKey: [...POLICY_KEYS.plans, { includeAll }],
    queryFn: () => fetchSubscriptionPlans(includeAll),
    staleTime: 60 * 1000,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlanInput) => createSubscriptionPlan(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_KEYS.plans });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: PlanInput }) =>
      updateSubscriptionPlan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_KEYS.plans });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POLICY_KEYS.plans });
    },
  });
}
