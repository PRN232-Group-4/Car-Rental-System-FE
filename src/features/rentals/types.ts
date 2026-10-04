export interface RentalBookingRequest {
  rentalType: "hourly" | "longterm" | string;
  vehicleId: number | string;
  facilityId?: number | string;
  vehicleName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  driverLicenseNumber?: string;
  hasDriver?: boolean;
  startTime: string;
  endTime: string;
  totalHours?: number;
  totalMonths?: number;
  estimatedCost?: number;
  isSubscription?: boolean;
  subscriptionId?: number | string;
  policyId?: number;
}

export interface Rental {
  id: number | string;
  customerId?: number | string;
  vehicleId: number | string;
  vehicleName?: string;
  rentalType: "hourly" | "longterm" | string;
  status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled" | string;
  isSubscription: boolean;
  subscriptionId?: number | string;
  vatPrice: number;
  depositPrice: number;
  overtimePrice: number;
  totalPrice: number;
  startTime?: string | null;
  endTime?: string | null;
  hasDriver?: boolean;
}

export interface RentalBookingResponse {
  success: boolean;
  bookingId: string | number;
  message: string;
  rental?: Rental;
  invoiceId?: number | string;
}
