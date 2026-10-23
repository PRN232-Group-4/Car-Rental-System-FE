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
  paymentMethod?: "payos" | "cash";
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
  orderId?: number | string | null;
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
  bookingId?: string | number;
  message: string;
  rental?: Rental;
  invoiceId?: number | string;
}

export interface RentalPolicy {
  id: number;
  vehicleTypeId: number | null;
  name: string | null;
  vatRate: number;
  depositPercentage: number;
  overtimeFeeRate: number;
  isActive: boolean;
}

export interface RentalContract extends Rental {
  contractLink: string | null;
  signedAt: string | null;
  hasUploadedContract?: boolean;
  hourlyPriceSnapshot?: number | null;
  monthlyPriceSnapshot?: number | null;
}
