export type TripStatus =
  | "pending"
  | "pre_inspection"
  | "renting"
  | "post_inspection"
  | "completed"
  | "cancelled";

export type TripTab = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface TripListItem {
  id: number;
  orderId?: number | null;
  status: TripStatus;
  rentalType: "hourly" | "longterm";
  isSubscription: boolean;
  subscriptionHoursUsed?: number;
  vehicle: {
    id: number;
    brand: string;
    model: string;
    licensePlate?: string;
    mainImageUrl?: string;
    category?: string;
  };
  start: string; // ISO UTC
  end: string; // ISO UTC
  totalPrice: number;
  nextAction?: "pay_deposit" | "view" | "report_issue" | "rebook";
  canCancel: boolean;
  facility?: {
    id?: number;
    name: string;
    phone?: string;
  };
}

export interface TripInspectionItem {
  type: "pre_rental" | "post_rental";
  isOk: boolean | null;
  odometerKm?: number;
  fuelBatteryLevel?: number;
  damageNotes?: string;
  imgUrls: string[];
  inspectedAt?: string;
}

export interface TripTimelineItem {
  to: TripStatus;
  at: string;
  actor: "customer" | "staff" | "system";
  reason?: string;
}

export interface CancellationPreview {
  rentalId: number;
  canCancel: boolean;
  cancellationFee: number;
  refundAmount: number;
  refundPercentage: number;
  freeUntil?: string;
  reason?: string;
  rulesExplanation?: string;
}

export interface TripDetail extends TripListItem {
  color?: string;
  hasDriver: boolean;
  pickup?: {
    method?: string;
    location?: string;
  };
  driver?: {
    fullName: string;
    avatarUrl?: string;
    rating?: number;
  } | null;
  price: {
    rent: number;
    vat: number;
    deposit: number;
    overtime: number;
    total: number;
  };
  invoice?: {
    id: number;
    number: string;
    status: string;
    amount: number;
  } | null;
  inspections: TripInspectionItem[];
  settlement?: {
    overtimeHours: number;
    depositHeld: number;
    depositDeducted: number;
    refundAmount?: number;
    refundStatus?: "requested" | "paid" | "rejected";
    shortfallInvoiceId?: number;
  } | null;
  timeline: TripTimelineItem[];
  cancellation?: {
    allowed: boolean;
    feeAmount: number;
    refundAmount: number;
    freeUntil?: string;
    reasons?: string[];
  };
}

export interface CancelTripInput {
  rentalId: number;
  reason: string;
}
