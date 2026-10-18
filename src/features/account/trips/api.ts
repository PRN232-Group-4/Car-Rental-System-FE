import { apiClient, ApiProblemError } from "@/api";
import type {
  TripListItem,
  TripDetail,
  TripTab,
  CancellationPreview,
  CancelTripInput,
} from "./types";

export interface PagedTripsResult {
  items: TripListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Mock store đa dạng kịch bản cho phát triển & testing
const mockTripsList: TripDetail[] = [
  // 1. Đơn pending trước 24h (hủy miễn phí)
  {
    id: 101,
    status: "pending",
    rentalType: "hourly",
    isSubscription: false,
    vehicle: {
      id: 1,
      brand: "VinFast",
      model: "VF 8 Plus",
      licensePlate: "51K-888.99",
      mainImageUrl: "/vehicles/vf8.png",
      category: "SUV 5 chỗ",
    },
    color: "Trắng Ngọc Trai",
    hasDriver: false,
    start: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    end: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    totalPrice: 2700000,
    nextAction: "pay_deposit",
    canCancel: true,
    facility: {
      id: 1,
      name: "Trạm Trung tâm Quận 1",
      phone: "028 3822 9999",
    },
    pickup: {
      method: "Nhận tại trạm",
      location: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    driver: null,
    price: {
      rent: 2200000,
      vat: 220000,
      deposit: 280000,
      overtime: 0,
      total: 2700000,
    },
    invoice: {
      id: 501,
      number: "INV-2026-00101",
      status: "pending",
      amount: 2700000,
    },
    inspections: [],
    settlement: null,
    timeline: [
      {
        to: "pending",
        at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        actor: "customer",
        reason: "Khách hàng tạo đơn thuê trực tuyến",
      },
    ],
    cancellation: {
      allowed: true,
      feeAmount: 0,
      refundAmount: 2700000,
      freeUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      reasons: [
        "Thay đổi lịch trình cá nhân",
        "Tìm được phương tiện khác phù hợp hơn",
        "Điều kiện thời tiết không thuận lợi",
        "Có sự cố đột xuất",
      ],
    },
  },

  // 2. Đơn renting đang diễn ra đúng hạn
  {
    id: 102,
    status: "renting",
    rentalType: "hourly",
    isSubscription: false,
    vehicle: {
      id: 2,
      brand: "Hyundai",
      model: "Santa Fe 2.5 AWD",
      licensePlate: "51H-777.66",
      mainImageUrl: "/vehicles/santafe.png",
      category: "SUV 7 chỗ",
    },
    color: "Đen Kim Cương",
    hasDriver: true,
    driver: {
      fullName: "Trần Văn Tài",
      avatarUrl: "",
      rating: 4.95,
    },
    start: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    end: new Date(Date.now() + 8 * 3600 * 1000).toISOString(), // Còn 8 tiếng
    totalPrice: 3200000,
    nextAction: "report_issue",
    canCancel: false,
    facility: {
      id: 2,
      name: "Trạm Sân Bay Tân Sơn Nhất",
      phone: "028 3844 5555",
    },
    pickup: {
      method: "Giao xe tận nơi",
      location: "Nhà ga Quốc nội T1, Tân Sơn Nhất",
    },
    price: {
      rent: 2600000,
      vat: 260000,
      deposit: 340000,
      overtime: 0,
      total: 3200000,
    },
    invoice: {
      id: 502,
      number: "INV-2026-00102",
      status: "paid",
      amount: 3200000,
    },
    inspections: [
      {
        type: "pre_rental",
        isOk: true,
        odometerKm: 24500,
        fuelBatteryLevel: 95,
        damageNotes: "Không có vết xước thân xe, nội thất sạch sẽ đạt chuẩn.",
        imgUrls: ["/vehicles/santafe-front.jpg", "/vehicles/santafe-odometer.jpg"],
        inspectedAt: new Date(Date.now() - 4.5 * 3600 * 1000).toISOString(),
      },
    ],
    settlement: null,
    timeline: [
      {
        to: "pending",
        at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        actor: "customer",
      },
      {
        to: "pre_inspection",
        at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        actor: "staff",
        reason: "Kiểm tra bàn giao phương tiện",
      },
      {
        to: "renting",
        at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        actor: "system",
        reason: "Bàn giao chìa khóa và bắt đầu hành trình",
      },
    ],
    cancellation: {
      allowed: false,
      feeAmount: 3200000,
      refundAmount: 0,
    },
  },

  // 3. Đơn completed có quá giờ + hoàn cọc đã xử lý
  {
    id: 103,
    status: "completed",
    rentalType: "hourly",
    isSubscription: false,
    vehicle: {
      id: 3,
      brand: "Mazda",
      model: "CX-5 2.0 Premium",
      licensePlate: "51G-555.22",
      mainImageUrl: "/vehicles/cx5.png",
      category: "Crossover 5 chỗ",
    },
    color: "Đỏ Pha Lê Soul Red",
    hasDriver: false,
    start: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    end: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    totalPrice: 2400000,
    nextAction: "rebook",
    canCancel: false,
    facility: {
      id: 1,
      name: "Trạm Trung tâm Quận 1",
      phone: "028 3822 9999",
    },
    price: {
      rent: 1950000,
      vat: 195000,
      deposit: 255000,
      overtime: 150000, // Phát sinh trễ 1 giờ
      total: 2550000,
    },
    invoice: {
      id: 503,
      number: "INV-2026-00103",
      status: "paid",
      amount: 2400000,
    },
    inspections: [
      {
        type: "pre_rental",
        isOk: true,
        odometerKm: 31200,
        fuelBatteryLevel: 100,
        damageNotes: "Xe mới bảo dưỡng định kỳ.",
        imgUrls: ["/vehicles/cx5-pre.jpg"],
        inspectedAt: new Date(Date.now() - 73 * 3600 * 1000).toISOString(),
      },
      {
        type: "post_rental",
        isOk: true,
        odometerKm: 31450,
        fuelBatteryLevel: 98,
        damageNotes: "Thân vỏ nguyên vẹn, trả xe trễ 1 giờ theo thỏa thuận.",
        imgUrls: ["/vehicles/cx5-post.jpg"],
        inspectedAt: new Date(Date.now() - 47 * 3600 * 1000).toISOString(),
      },
    ],
    settlement: {
      overtimeHours: 1,
      depositHeld: 255000,
      depositDeducted: 150000, // Khấu trừ phí trễ vào cọc
      refundAmount: 105000, // Hoàn lại phần cọc còn lại
      refundStatus: "paid",
    },
    timeline: [
      {
        to: "pending",
        at: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
        actor: "customer",
      },
      {
        to: "renting",
        at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        actor: "staff",
      },
      {
        to: "post_inspection",
        at: new Date(Date.now() - 47 * 3600 * 1000).toISOString(),
        actor: "staff",
        reason: "Kiểm định hoàn tất nhận xe",
      },
      {
        to: "completed",
        at: new Date(Date.now() - 46 * 3600 * 1000).toISOString(),
        actor: "system",
        reason: "Quyết toán hoàn tất tiền cọc",
      },
    ],
  },

  // 4. Đơn gói thuê bao (isSubscription: true)
  {
    id: 104,
    status: "completed",
    rentalType: "hourly",
    isSubscription: true,
    subscriptionHoursUsed: 14,
    vehicle: {
      id: 4,
      brand: "VinFast",
      model: "VF e34",
      licensePlate: "51E-333.11",
      mainImageUrl: "/vehicles/vfe34.png",
      category: "Crossover Điện",
    },
    color: "Xanh Aurora Blue",
    hasDriver: false,
    start: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    end: new Date(Date.now() - 106 * 3600 * 1000).toISOString(),
    totalPrice: 0, // Đơn gói không tính tiền lẻ
    nextAction: "rebook",
    canCancel: false,
    facility: {
      id: 1,
      name: "Trạm Trung tâm Quận 1",
    },
    price: {
      rent: 0,
      vat: 0,
      deposit: 0,
      overtime: 0,
      total: 0,
    },
    invoice: null, // Không có hóa đơn lẻ
    inspections: [
      {
        type: "pre_rental",
        isOk: true,
        odometerKm: 18000,
        fuelBatteryLevel: 100,
        imgUrls: [],
        inspectedAt: new Date(Date.now() - 121 * 3600 * 1000).toISOString(),
      },
    ],
    settlement: null,
    timeline: [
      {
        to: "renting",
        at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
        actor: "customer",
        reason: "Bắt đầu chuyến đi theo Gói Đô Thị Thông Minh",
      },
      {
        to: "completed",
        at: new Date(Date.now() - 106 * 3600 * 1000).toISOString(),
        actor: "system",
        reason: "Đã trừ 14 giờ vào hạn mức gói của bạn",
      },
    ],
  },

  // 5. Đơn đã hủy
  {
    id: 105,
    status: "cancelled",
    rentalType: "hourly",
    isSubscription: false,
    vehicle: {
      id: 1,
      brand: "VinFast",
      model: "VF 8 Plus",
      licensePlate: "51K-888.99",
      mainImageUrl: "/vehicles/vf8.png",
    },
    hasDriver: false,
    start: new Date(Date.now() - 200 * 3600 * 1000).toISOString(),
    end: new Date(Date.now() - 176 * 3600 * 1000).toISOString(),
    totalPrice: 2700000,
    nextAction: "rebook",
    canCancel: false,
    facility: {
      id: 1,
      name: "Trạm Trung tâm Quận 1",
    },
    price: {
      rent: 2200000,
      vat: 220000,
      deposit: 280000,
      overtime: 0,
      total: 2700000,
    },
    invoice: null,
    inspections: [],
    settlement: {
      overtimeHours: 0,
      depositHeld: 0,
      depositDeducted: 0,
      refundAmount: 2700000,
      refundStatus: "paid",
    },
    timeline: [
      {
        to: "pending",
        at: new Date(Date.now() - 210 * 3600 * 1000).toISOString(),
        actor: "customer",
      },
      {
        to: "cancelled",
        at: new Date(Date.now() - 205 * 3600 * 1000).toISOString(),
        actor: "customer",
        reason: "Khách hàng hủy miễn phí trước 24 giờ",
      },
    ],
  },
];

export async function fetchMyTrips(
  tab: TripTab = "upcoming",
  page = 1,
  pageSize = 12
): Promise<PagedTripsResult> {
  try {
    const res = await apiClient.get<PagedTripsResult>(
      `/api/rentals/mine?tab=${tab}&page=${page}&pageSize=${pageSize}`
    );
    if (res && Array.isArray(res.items)) return res;
  } catch {
    // fallback mock
  }

  const filtered = mockTripsList.filter((item) => {
    switch (tab) {
      case "upcoming":
        return item.status === "pending" || item.status === "pre_inspection";
      case "ongoing":
        return item.status === "renting";
      case "completed":
        return item.status === "post_inspection" || item.status === "completed";
      case "cancelled":
        return item.status === "cancelled";
      default:
        return true;
    }
  });

  const startIdx = (page - 1) * pageSize;
  const pagedItems = filtered.slice(startIdx, startIdx + pageSize);

  return {
    items: pagedItems,
    totalCount: filtered.length,
    page,
    pageSize,
  };
}

export async function fetchMyTripDetail(id: number): Promise<TripDetail> {
  try {
    const res = await apiClient.get<TripDetail>(`/api/rentals/mine/${id}`);
    if (res && res.id === id) return res;
  } catch {
    // fallback mock
  }

  const found = mockTripsList.find((t) => t.id === id);
  if (!found) {
    throw new ApiProblemError(404, "Not Found", {
      type: "https://httpstatuses.com/404",
      title: "RENTAL_NOT_FOUND",
      detail: `Không tìm thấy chuyến đi #${id} hoặc bạn không có quyền truy cập.`,
    });
  }
  return found;
}

export async function fetchCancellationPreview(rentalId: number): Promise<CancellationPreview> {
  try {
    const res = await apiClient.get<CancellationPreview>(
      `/api/rentals/${rentalId}/cancellation-preview`
    );
    if (res && res.rentalId === rentalId) return res;
  } catch {
    // fallback mock
  }

  const trip = mockTripsList.find((t) => t.id === rentalId);
  if (!trip) {
    throw new ApiProblemError(404, "Not Found", {
      title: "RENTAL_NOT_FOUND",
      detail: "Không tìm thấy đơn thuê",
    });
  }

  // Tính phí phạt theo thời gian thực tế tới start:
  // Nếu cách giờ nhận >= 24h: miễn phí (phí = 0, hoàn 100%)
  // Nếu cách giờ nhận < 24h: giữ 20% tiền thuê + VAT, hoàn 80%
  const startTime = new Date(trip.start).getTime();
  const diffHours = (startTime - Date.now()) / (3600 * 1000);

  if (diffHours >= 24) {
    return {
      rentalId,
      canCancel: true,
      cancellationFee: 0,
      refundAmount: trip.totalPrice,
      refundPercentage: 100,
      freeUntil: new Date(startTime - 24 * 3600 * 1000).toISOString(),
      reason: "Hủy miễn phí trước 24 giờ nhận xe",
      rulesExplanation: "Bạn được hoàn lại 100% số tiền đặt cọc và tiền thuê đã thanh toán.",
    };
  } else if (diffHours > 0) {
    const fee = Math.round(trip.totalPrice * 0.2);
    const refund = trip.totalPrice - fee;
    return {
      rentalId,
      canCancel: true,
      cancellationFee: fee,
      refundAmount: refund,
      refundPercentage: 80,
      reason: "Hủy trong vòng 24 giờ trước nhận xe",
      rulesExplanation:
        "Theo chính sách thuê, hủy trong vòng 24h sẽ giữ 20% phí giữ xe; hoàn trả 80% vào tài khoản của bạn.",
    };
  } else {
    return {
      rentalId,
      canCancel: false,
      cancellationFee: trip.totalPrice,
      refundAmount: 0,
      refundPercentage: 0,
      reason: "Đã đến hoặc quá thời điểm nhận xe",
      rulesExplanation: "Chuyến đi đã đến giờ nhận xe; không thể tự hủy trực tuyến.",
    };
  }
}

export async function cancelTrip({ rentalId, reason }: CancelTripInput): Promise<TripDetail> {
  try {
    const res = await apiClient.post<TripDetail>(`/api/rentals/${rentalId}/cancel`, {
      reason,
      initiator: "customer",
      waiveFee: false,
    });
    return res;
  } catch (err) {
    if (err instanceof ApiProblemError) throw err;
  }

  const idx = mockTripsList.findIndex((t) => t.id === rentalId);
  if (idx === -1) {
    throw new ApiProblemError(404, "Not Found", {
      title: "RENTAL_NOT_FOUND",
      detail: "Không tìm thấy đơn thuê",
    });
  }

  const target = mockTripsList[idx]!;
  if (!target.canCancel) {
    throw new ApiProblemError(409, "Conflict", {
      title: "SELF_CANCEL_NOT_ALLOWED",
      detail: "Đã đến giờ nhận xe, không thể tự hủy chuyến đi trực tuyến. Vui lòng liên hệ hotline chi nhánh để được hỗ trợ.",
    });
  }

  const updated: TripDetail = {
    ...target,
    status: "cancelled",
    canCancel: false,
    timeline: [
      ...target.timeline,
      {
        to: "cancelled",
        at: new Date().toISOString(),
        actor: "customer",
        reason: reason || "Khách hàng hủy chuyến",
      },
    ],
  };

  mockTripsList[idx] = updated;
  return updated;
}
