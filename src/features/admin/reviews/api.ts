import { backendApiClient } from "@/api/backend-api-client";
import { unsupportedApi } from "@/api/unsupported";
import { fetchAllStaff, getStaffById } from "@/features/admin/staff/api";
import type { RatingSummary, ReviewDetail, ReviewFilterParams, ReviewListItem } from "./types";

export interface ReviewsResponse { items: ReviewListItem[]; page: number; pageSize: number; totalCount: number }
interface StaffRating {
  id: number;
  rentalId: number;
  staffId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  status?: string | null;
  customerName?: string | null;
  replyText?: string | null;
  replyBy?: string | null;
  replyAt?: string | null;
}

async function loadRatings(staffId?: number): Promise<ReviewDetail[]> {
  const staff = staffId ? [await getStaffById(staffId)] : await fetchAllStaff();
  const groups = await Promise.all(staff.map(async (person) => {
    const response = await backendApiClient.get<StaffRating[] | { items?: StaffRating[] }>(`staff/${person.id}/ratings`);
    const ratings = Array.isArray(response) ? response : (response.items ?? []);
    return ratings.map((rating): ReviewDetail => ({
      id: rating.id,
      rating: rating.rating,
      comment: rating.comment ?? "",
      commentPreview: rating.comment ?? "",
      createdAt: rating.createdAt,
      rentalId: rating.rentalId,
      staff: { id: person.id, fullName: person.fullName, isDriver: person.isDriver, departmentName: person.department?.name },
      customerName: rating.customerName || "API chưa cung cấp tên khách hàng",
      status: (rating.status === "visible" || rating.status === "hidden" || rating.status === "reported") ? rating.status : "unavailable",
      hasReply: Boolean(rating.replyText),
      reply: rating.replyText ? { text: rating.replyText, by: rating.replyBy ?? "Quản lý", at: rating.replyAt ?? rating.createdAt } : undefined,
    }));
  }));
  return groups.flat();
}

export async function fetchReviews(params: ReviewFilterParams = {}): Promise<ReviewsResponse> {
  if ((params.status && params.status !== "all") || params.hasReply !== undefined) {
    return unsupportedApi("lọc trạng thái kiểm duyệt/phản hồi (StaffRating chưa trả status, reply)");
  }
  let ratings = await loadRatings(params.staffId);
  if (params.rating) ratings = ratings.filter((r) => r.rating === params.rating);
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    ratings = ratings.filter((r) => `${r.staff.fullName} ${r.comment}`.toLowerCase().includes(q));
  }
  if (params.from) ratings = ratings.filter((r) => r.createdAt >= params.from!);
  if (params.to) ratings = ratings.filter((r) => r.createdAt <= params.to!);
  ratings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  return { items: ratings.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalCount: ratings.length };
}

export async function fetchReviewDetail(id: number): Promise<ReviewDetail> {
  const rating = (await loadRatings()).find((item) => item.id === id);
  if (!rating) throw new Error("Không tìm thấy đánh giá. Vui lòng tải lại danh sách.");
  return rating;
}

export async function fetchRatingSummary(staffId?: number): Promise<RatingSummary> {
  const ratings = await loadRatings(staffId);
  const distribution: RatingSummary["distribution"] = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const r of ratings) {
    const star = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (star in distribution) distribution[star]++;
  }
  return {
    count: ratings.length, average: ratings.length ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)) : null,
    distribution,
  };
}

export async function hideReview(payload: { id: number; reason: string }): Promise<ReviewDetail> {
  void payload; return unsupportedApi("ẩn đánh giá (cần PATCH /api/rating/{id})"); }
export async function unhideReview(id: number): Promise<ReviewDetail> {
  void id; return unsupportedApi("hiện lại đánh giá (cần PATCH /api/rating/{id})"); }
export async function replyReview(payload: { id: number; replyText: string }): Promise<ReviewDetail> {
  void payload; return unsupportedApi("trả lời đánh giá (cần POST /api/rating/{id}/reply)"); }
