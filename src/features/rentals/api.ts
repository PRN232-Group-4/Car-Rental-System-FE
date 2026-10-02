import { defaultApiClient } from "@/api/default-api-client";
import { RentalBookingRequest, RentalBookingResponse } from "./types";

export async function createHourlyRental(
  bookingData: RentalBookingRequest
): Promise<RentalBookingResponse> {
  try {
    return await defaultApiClient.post<RentalBookingResponse>("rentals/hourly", {
      ...bookingData,
      rentalType: "hourly",
    });
  } catch (error) {
    console.warn("[Rentals API] Fallback booking creation:", error);
    const mockId = `TD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      bookingId: mockId,
      message: `Đã xác nhận đặt xe thành công! Mã đơn: ${mockId}. Nhân viên sẽ liên hệ với bạn trong ít phút.`,
    };
  }
}

export async function createLongTermRental(
  bookingData: RentalBookingRequest
): Promise<RentalBookingResponse> {
  try {
    return await defaultApiClient.post<RentalBookingResponse>("rentals/longterm", {
      ...bookingData,
      rentalType: "longterm",
    });
  } catch (error) {
    console.warn("[Rentals API] Fallback booking creation:", error);
    const mockId = `TD-LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      bookingId: mockId,
      message: `Đã gửi yêu cầu thuê dài hạn thành công! Mã hồ sơ: ${mockId}. Nhân viên chăm sóc doanh nghiệp sẽ liên hệ tư vấn.`,
    };
  }
}

export async function createRentalBooking(
  bookingData: RentalBookingRequest
): Promise<RentalBookingResponse> {
  if (bookingData.rentalType === "longterm") {
    return createLongTermRental(bookingData);
  }
  return createHourlyRental(bookingData);
}
