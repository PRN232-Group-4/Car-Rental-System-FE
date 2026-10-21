import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { backendApiClient } from "@/api/backend-api-client";
import { fetchReviews, fetchRatingSummary, hideReview, replyReview } from "@/features/admin/reviews/api";
import { ReviewDetailView } from "@/features/admin/reviews/components/ReviewDetailView";
import type { ReviewDetail } from "@/features/admin/reviews/types";

beforeEach(() => vi.restoreAllMocks());

const review: ReviewDetail = {
  id: 800, rentalId: 91, rating: 4.5, commentPreview: "Nhận xét", comment: '<script>alert("XSS")</script>',
  createdAt: "2027-01-01T08:00:00Z", status: "unavailable", hasReply: false,
  staff: { id: 22, fullName: "Nguyễn Văn An", isDriver: true }, customerName: "API chưa cung cấp tên khách hàng",
};

function renderDetail() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><ReviewDetailView review={review} /></QueryClientProvider>);
}

describe("Real staff rating integration", () => {
  it("reads staff ratings and computes summary from returned scores", async () => {
    vi.spyOn(backendApiClient, "get").mockImplementation(async (path) => {
      if (path === "staff") return { items: [{ id: 22, userId: 2, fullName: "Nguyễn Văn An", email: "an@example.com", isDriver: true, isActive: true }], totalCount: 1 };
      if (path === "staff/22/ratings") return [{ id: 800, rentalId: 91, staffId: 22, rating: 4.5, comment: "Nhận xét thực", createdAt: "2027-01-01T08:00:00Z" }];
      throw new Error("Unexpected test API: " + path);
    });
    const result = await fetchReviews();
    expect(result.items).toEqual([expect.objectContaining({ id: 800, rating: 4.5, status: "unavailable", commentPreview: "Nhận xét thực" })]);
    expect(await fetchRatingSummary()).toMatchObject({ average: 4.5, count: 1 });
  });
  it("does not return mock ratings on API failure or pretend moderation succeeded", async () => {
    const error = new Error("Không có quyền truy cập");
    vi.spyOn(backendApiClient, "get").mockRejectedValue(error);
    await expect(fetchReviews()).rejects.toBe(error);
    await expect(hideReview({ id: 800, reason: "Lý do" })).rejects.toMatchObject({ status: 501 });
    await expect(replyReview({ id: 800, replyText: "Cảm ơn" })).rejects.toMatchObject({ status: 501 });
  });
  it("preserves the detail layout, renders XSS as text and disables unsupported replies", () => {
    const { container } = renderDetail();
    expect(screen.getByText('<script>alert("XSS")</script>')).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("Phản hồi chính thức cho khách")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lưu phản hồi" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /xóa vĩnh viễn/i })).toBeNull();
    expect(screen.queryByText(/4\.65|Cân nhắc tác động điểm số/)).toBeNull();
  });
});
