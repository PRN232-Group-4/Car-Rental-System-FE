export type ReviewStatus = "visible" | "hidden" | "reported" | "unavailable";

export interface ReviewStaffSummary {
  id: number;
  fullName: string;
  avatarUrl?: string;
  isDriver: boolean;
  departmentName?: string;
}

export interface ReviewListItem {
  id: number;
  rating: number;
  commentPreview: string;
  status: ReviewStatus;
  createdAt: string;
  staff: ReviewStaffSummary;
  customerName: string;
  rentalId: number;
  hasReply: boolean;
}

export interface ReviewReply {
  text: string;
  by?: string;
  at: string;
}

export interface ReviewHiddenInfo {
  reason: string;
  by?: string;
  at: string;
}

export interface ReviewRentalContext {
  id: number;
  vehicleName: string;
  licensePlate?: string;
  start: string;
  end: string;
  status: string;
}

export interface ReviewImpact {
  averageBefore: number;
  averageAfter: number;
  diff?: number;
}

export interface ReviewDetail extends ReviewListItem {
  comment: string;
  reply?: ReviewReply | null;
  hiddenInfo?: ReviewHiddenInfo | null;
  rental?: ReviewRentalContext | null;
  impact?: ReviewImpact | null;
}

export interface RatingSummary {
  average: number | null;
  count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface ReviewFilterParams {
  search?: string;
  staffId?: number;
  rating?: number;
  status?: ReviewStatus | "all";
  hasReply?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
