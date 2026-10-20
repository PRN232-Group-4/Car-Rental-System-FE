import type { OperationalRental } from "@/features/operations/api";

/** Dữ liệu mẫu dùng riêng trong test cho hồ sơ đơn thuê #101. */
export const RENTAL_101: OperationalRental = {
  id: 101,
  customerId: 1,
  vehicleId: 1,
  vehicleName: "Toyota Corolla Cross 1.8V",
  startTime: new Date(Date.now() - 3600000 * 2).toISOString(),
  endTime: new Date(Date.now() + 3600000 * 6).toISOString(),
  status: "renting",
  rentalType: "hourly",
  hasDriver: false,
  isSubscription: false,
  vatPrice: 45000,
  depositPrice: 2000000,
  overtimePrice: 0,
  totalPrice: 450000,
  contractLink: null,
  signedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  hourlyPriceSnapshot: 150000,
  monthlyPriceSnapshot: null,
} as OperationalRental;
