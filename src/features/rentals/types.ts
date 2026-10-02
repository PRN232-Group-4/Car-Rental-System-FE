export interface RentalBookingRequest {
  rentalType: "hourly" | "longterm";
  vehicleId: string;
  facilityId?: string;
  vehicleName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  driverLicenseNumber?: string;
  hasDriver?: boolean;
  startTime: string;
  endTime: string;
  totalHours?: number;
  totalMonths?: number;
  estimatedCost?: number;
}

export interface RentalBookingResponse {
  success: boolean;
  bookingId: string;
  message: string;
  rental?: unknown;
}
