import type {
  ReviewListItem,
  ReviewDetail,
  RatingSummary,
  ReviewFilterParams,
} from "./types";

// ----------------- MOCK DATASET ----------------- //

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const MOCK_REVIEWS: ReviewDetail[] = [
  {
    id: 1,
    rating: 5,
    commentPreview: "Tài xế lái xe rất cẩn thận, đón đúng giờ và hỗ trợ mang vác hành lý chu đáo.",
    comment:
      "Tài xế lái xe rất cẩn thận, đón đúng giờ và hỗ trợ mang vác hành lý chu đáo. Xe sạch sẽ thơm tho, suốt chuyến đi tài xế rất lịch sự và nhiệt tình chỉ dẫn các điểm tham quan.",
    status: "visible",
    createdAt: new Date(NOW - 2 * DAY).toISOString(),
    staff: {
      id: 12,
      fullName: "Nguyễn Văn Tài",
      isDriver: true,
      departmentName: "Đội Tài Xế CN Quận 1",
    },
    customerName: "Trần Thị Bích",
    rentalId: 1045,
    hasReply: true,
    reply: {
      text: "Cảm ơn quý khách đã tin tưởng dịch vụ tài xế Thong Dong. Chúc quý khách vạn dặm bình an!",
      by: "Quản trị viên Thong Dong",
      at: new Date(NOW - 1 * DAY).toISOString(),
    },
    rental: {
      id: 1045,
      vehicleName: "VinFast VF 8 Plus",
      licensePlate: "51K-899.21",
      start: new Date(NOW - 3 * DAY).toISOString(),
      end: new Date(NOW - 2 * DAY).toISOString(),
      status: "completed",
    },
    impact: {
      averageBefore: 4.88,
      averageAfter: 4.85,
    },
  },
  {
    id: 2,
    rating: 4,
    commentPreview: "Nhân viên giao nhận xe kiểm tra chi tiết, thủ tục nhanh gọn.",
    comment:
      "Nhân viên giao nhận xe kiểm tra chi tiết các vết xước có sẵn, bàn giao hợp đồng và quay video minh bạch. Thủ tục nhận xe nhanh chóng.",
    status: "visible",
    createdAt: new Date(NOW - 1 * DAY).toISOString(),
    staff: {
      id: 15,
      fullName: "Lê Hoàng Yến",
      isDriver: false,
      departmentName: "Khối Giao Nhận & Vận Hành",
    },
    customerName: "Vũ Minh Quân",
    rentalId: 1048,
    hasReply: false,
    rental: {
      id: 1048,
      vehicleName: "Hyundai Tucson 2.0 AT",
      licensePlate: "51F-123.45",
      start: new Date(NOW - 2 * DAY).toISOString(),
      end: new Date(NOW - 1 * DAY).toISOString(),
      status: "completed",
    },
    impact: {
      averageBefore: 4.6,
      averageAfter: 4.65,
    },
  },
  {
    id: 3,
    rating: 1,
    commentPreview: "Tài xế đi ẩu, lạng lách trên đường cao tốc còn lớn tiếng với hành khách.",
    comment:
      "Tài xế đi ẩu, lạng lách trên đường cao tốc còn lớn tiếng với hành khách. Đang chở người già và trẻ nhỏ mà đạp ga phanh gấp liên tục. Đề nghị ban quản lý kỷ luật và hoàn lại tiền dịch vụ tài xế!",
    status: "reported",
    createdAt: new Date(NOW - 12 * HOUR).toISOString(),
    staff: {
      id: 22,
      fullName: "Đỗ Quốc Bảo",
      isDriver: true,
      departmentName: "Đội Tài Xế CN Tân Bình",
    },
    customerName: "Hoàng Mai Linh",
    rentalId: 1052,
    hasReply: false,
    rental: {
      id: 1052,
      vehicleName: "Kia Carnival Signature",
      licensePlate: "51G-888.66",
      start: new Date(NOW - 18 * HOUR).toISOString(),
      end: new Date(NOW - 12 * HOUR).toISOString(),
      status: "completed",
    },
    impact: {
      averageBefore: 4.5,
      averageAfter: 4.75,
    },
  },
  {
    id: 4,
    rating: 2,
    commentPreview: "Đánh giá đã bị ẩn kiểm duyệt do vi phạm ngôn từ xúc phạm.",
    comment:
      "Đánh giá này chứa ngôn từ thiếu chuẩn mực đã được kiểm duyệt: Nhân viên nói chuyện cộc cằn, dịch vụ như đồ bỏ đi.",
    status: "hidden",
    hiddenInfo: {
      reason: "Ngôn từ xúc phạm hoặc thiếu chuẩn mực",
      by: "Phạm Quản Lý (Admin)",
      at: new Date(NOW - 3 * DAY).toISOString(),
    },
    createdAt: new Date(NOW - 4 * DAY).toISOString(),
    staff: {
      id: 18,
      fullName: "Nguyễn Văn Hùng",
      isDriver: false,
      departmentName: "Khối Vận Hành Bãi Xe",
    },
    customerName: "Lê Tuấn Kiệt",
    rentalId: 1039,
    hasReply: false,
    rental: {
      id: 1039,
      vehicleName: "Toyota Fortuner Legender",
      licensePlate: "51H-999.11",
      start: new Date(NOW - 5 * DAY).toISOString(),
      end: new Date(NOW - 4 * DAY).toISOString(),
      status: "completed",
    },
    impact: {
      averageBefore: 4.4,
      averageAfter: 4.4,
    },
  },
  {
    id: 5,
    rating: 3,
    commentPreview: "Xe sạch nhưng tài xế tới muộn 15 phút so với giờ hẹn đặt trước.",
    comment:
      "Chất lượng xe thì tốt, vệ sinh sạch sẽ, nhưng tài xế tới muộn 15 phút làm trễ giờ hẹn của gia đình tôi. Cần chú ý thời gian chuẩn xác hơn.",
    status: "visible",
    createdAt: new Date(NOW - 5 * DAY).toISOString(),
    staff: {
      id: 14,
      fullName: "Trần Văn Đức",
      isDriver: true,
      departmentName: "Đội Tài Xế CN Quận 1",
    },
    customerName: "Nguyễn Thị Thảo",
    rentalId: 1035,
    hasReply: true,
    reply: {
      text: "Thong Dong chân thành xin lỗi vì sự bất tiện trên do thời điểm đón gặp kẹt xe nghiêm trọng. Đội ngũ sẽ khắc phục lộ trình sớm hơn.",
      by: "Quản lý Đội xe",
      at: new Date(NOW - 4 * DAY).toISOString(),
    },
    rental: {
      id: 1035,
      vehicleName: "Mazda CX-5 Premium",
      licensePlate: "51E-345.67",
      start: new Date(NOW - 6 * DAY).toISOString(),
      end: new Date(NOW - 5 * DAY).toISOString(),
      status: "completed",
    },
    impact: {
      averageBefore: 4.62,
      averageAfter: 4.68,
    },
  },
  {
    id: 6,
    rating: 1,
    commentPreview: "Kiểm thử mã độc XSS và liên kết lừa đảo: <script>alert(1)</script>",
    comment:
      '<script>alert("XSS Attack Failed")</script><b onmouseover="alert(1)">Lừa đảo!</b> Xem bằng chứng tại https://phishing-scam.test/steal-money và gọi 0900000000.',
    status: "visible",
    createdAt: new Date(NOW - 6 * DAY).toISOString(),
    staff: {
      id: 12,
      fullName: "Nguyễn Văn Tài",
      isDriver: true,
      departmentName: "Đội Tài Xế CN Quận 1",
    },
    customerName: "Hacker Mũ Trắng",
    rentalId: 1022,
    hasReply: false,
    rental: {
      id: 1022,
      vehicleName: "VinFast VF 8 Plus",
      licensePlate: "51K-899.21",
      start: new Date(NOW - 7 * DAY).toISOString(),
      end: new Date(NOW - 6 * DAY).toISOString(),
      status: "completed",
    },
    impact: {
      averageBefore: 4.88,
      averageAfter: 4.92,
    },
  },
  {
    id: 7,
    rating: 5,
    commentPreview: "Tài xế am hiểu đường sá, đi êm ái, xe không mùi hôi.",
    comment: "Tài xế am hiểu đường sá, chạy êm ái, xe không mùi say xe. Rất hài lòng với dịch vụ lần này của Thong Dong.",
    status: "visible",
    createdAt: new Date(NOW - 8 * DAY).toISOString(),
    staff: {
      id: 12,
      fullName: "Nguyễn Văn Tài",
      isDriver: true,
      departmentName: "Đội Tài Xế CN Quận 1",
    },
    customerName: "Bùi Tiến Đạt",
    rentalId: 1015,
    hasReply: false,
    rental: {
      id: 1015,
      vehicleName: "VinFast VF 8 Plus",
      licensePlate: "51K-899.21",
      start: new Date(NOW - 9 * DAY).toISOString(),
      end: new Date(NOW - 8 * DAY).toISOString(),
      status: "completed",
    },
  },
  {
    id: 8,
    rating: 5,
    commentPreview: "Dịch vụ tài xế 5 sao tuyệt vời, tác phong chuẩn mực.",
    comment: "Tác phong chuyên nghiệp, đúng chuẩn mực dịch vụ cao cấp. Xe thơm mát và luôn mở cửa đón khách.",
    status: "visible",
    createdAt: new Date(NOW - 10 * DAY).toISOString(),
    staff: {
      id: 12,
      fullName: "Nguyễn Văn Tài",
      isDriver: true,
      departmentName: "Đội Tài Xế CN Quận 1",
    },
    customerName: "Đặng Thu Thảo",
    rentalId: 1008,
    hasReply: false,
    rental: {
      id: 1008,
      vehicleName: "VinFast VF 8 Plus",
      licensePlate: "51K-899.21",
      start: new Date(NOW - 11 * DAY).toISOString(),
      end: new Date(NOW - 10 * DAY).toISOString(),
      status: "completed",
    },
  },
];

let inMemoryReviews = [...MOCK_REVIEWS];

export function resetReviewsMock() {
  inMemoryReviews = [...MOCK_REVIEWS];
}

// ----------------- API FUNCTIONS ----------------- //

export interface ReviewsResponse {
  items: ReviewListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export async function fetchReviews(params: ReviewFilterParams = {}): Promise<ReviewsResponse> {
  // Mock-first fallback
  let list = [...inMemoryReviews];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.staff.fullName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q)
    );
  }

  if (params.staffId) {
    list = list.filter((r) => r.staff.id === params.staffId);
  }

  if (params.rating) {
    list = list.filter((r) => r.rating === params.rating);
  }

  if (params.status && params.status !== "all") {
    list = list.filter((r) => r.status === params.status);
  }

  if (params.hasReply !== undefined) {
    list = list.filter((r) => r.hasReply === params.hasReply);
  }

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const pagedItems = list.slice(start, start + pageSize).map((r) => ({
    id: r.id,
    rating: r.rating,
    commentPreview: r.commentPreview,
    status: r.status,
    createdAt: r.createdAt,
    staff: r.staff,
    customerName: r.customerName,
    rentalId: r.rentalId,
    hasReply: r.hasReply,
  }));

  return {
    items: pagedItems,
    page,
    pageSize,
    totalCount: list.length,
  };
}

export async function fetchReviewDetail(id: number): Promise<ReviewDetail> {
  const item = inMemoryReviews.find((r) => r.id === id);
  if (!item) {
    throw new Error(`Không tìm thấy đánh giá #${id}`);
  }
  return { ...item };
}

export async function fetchRatingSummary(staffId?: number): Promise<RatingSummary> {
  // Lấy danh sách đánh giá visible
  const source = inMemoryReviews.filter(
    (r) => r.status === "visible" && (!staffId || r.staff.id === staffId)
  );

  const distribution: Record<"1" | "2" | "3" | "4" | "5", number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };

  let totalScore = 0;
  source.forEach((r) => {
    const starStr = String(r.rating) as "1" | "2" | "3" | "4" | "5";
    distribution[starStr] = (distribution[starStr] || 0) + 1;
    totalScore += r.rating;
  });

  const count = source.length;
  const average = count > 0 ? Number((totalScore / count).toFixed(2)) : null;

  return {
    average,
    count,
    distribution,
  };
}

export async function hideReview(payload: { id: number; reason: string }): Promise<ReviewDetail> {
  const review = inMemoryReviews.find((r) => r.id === payload.id);
  if (!review) {
    throw new Error(`Không tìm thấy đánh giá #${payload.id}`);
  }

  if (review.status === "hidden") {
    // 409 Conflict: Đánh giá đã bị ẩn trước đó
    const error = new Error("Đánh giá này đã ở trạng thái ẩn kiểm duyệt.") as Error & { status?: number };
    error.status = 409;
    throw error;
  }

  review.status = "hidden";
  review.hiddenInfo = {
    reason: payload.reason,
    by: "Quản trị viên",
    at: new Date().toISOString(),
  };

  return { ...review };
}

export async function unhideReview(id: number): Promise<ReviewDetail> {
  const review = inMemoryReviews.find((r) => r.id === id);
  if (!review) {
    throw new Error(`Không tìm thấy đánh giá #${id}`);
  }

  review.status = "visible";
  review.hiddenInfo = null;

  return { ...review };
}

export async function replyReview(payload: { id: number; replyText: string }): Promise<ReviewDetail> {
  const review = inMemoryReviews.find((r) => r.id === payload.id);
  if (!review) {
    throw new Error(`Không tìm thấy đánh giá #${payload.id}`);
  }

  const trimmed = payload.replyText.trim();
  if (trimmed.length < 5 || trimmed.length > 1000) {
    throw new Error("Nội dung phản hồi phải từ 5 đến 1000 ký tự.");
  }

  review.reply = {
    text: trimmed,
    by: "Đại diện Thong Dong",
    at: new Date().toISOString(),
  };
  review.hasReply = true;

  return { ...review };
}
