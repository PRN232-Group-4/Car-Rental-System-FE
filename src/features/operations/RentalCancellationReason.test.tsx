import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RENTAL_101 } from "@/__tests__/features/admin/rentals/rental-fixture";
import RentalCancellationReason from "./RentalCancellationReason";

const api = vi.hoisted(() => ({ getOperationalRentalDetail: vi.fn() }));
vi.mock("./api", async (original) => ({ ...await original<typeof import("./api")>(), ...api }));
beforeEach(() => vi.resetAllMocks());
function setup(status = "cancelled") {
  return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><RentalCancellationReason rental={{...RENTAL_101,status}} /></QueryClientProvider>);
}
it("reads the persisted cancellation reason instead of the flat rental", async () => {
  api.getOperationalRentalDetail.mockResolvedValue({rental:{cancelReason:"Khách đổi lịch\nNhận xe tuần sau",cancelledAt:"2026-10-22T03:21:00Z"},history:[]});
  setup();
  expect(await screen.findByRole("region",{name:"Lý do hủy đơn"})).toHaveTextContent("Khách đổi lịch Nhận xe tuần sau");
  expect(screen.getByText("Thời gian hủy: 22/10/2026 10:21")).toBeVisible();
});
it("uses cancellation history when the rental reason is missing", async () => {
  api.getOperationalRentalDetail.mockResolvedValue({rental:{cancelReason:null},history:[{toStatus:"pre_inspection",reason:"Không phải lý do hủy"},{toStatus:"cancelled",reason:"Khách có việc đột xuất",createdAt:"2026-10-22T03:21:00Z"}]});
  setup();
  expect(await screen.findByText("Khách có việc đột xuất")).toBeVisible();
  expect(screen.queryByText("Không phải lý do hủy")).not.toBeInTheDocument();
});
it("explains old records with no reason without inventing one", async () => {
  api.getOperationalRentalDetail.mockResolvedValue({rental:{cancelReason:"  "},history:[]});
  setup();
  expect(await screen.findByText("Chưa có lý do hủy được ghi nhận.")).toBeVisible();
});
it("shows retry on a read failure", async () => {
  api.getOperationalRentalDetail.mockRejectedValueOnce(new TypeError("network")).mockResolvedValueOnce({rental:{cancelReason:"Đổi lịch"},history:[]});
  setup();
  await screen.findByRole("alert");
  expect(screen.queryByText("Chưa có lý do hủy được ghi nhận.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button",{name:"Thử lại"}));
  expect(await screen.findByText("Đổi lịch")).toBeVisible();
});
it("does not fetch cancellation details for an active rental", () => {
  setup("pre_inspection");
  expect(api.getOperationalRentalDetail).not.toHaveBeenCalled();
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});
