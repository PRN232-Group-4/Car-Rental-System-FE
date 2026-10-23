import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiClientError } from "@/api/api-client";
import type { RentalContract } from "../types";

const api = vi.hoisted(() => ({ uploadRentalContract: vi.fn() }));
vi.mock("../api", () => api);
import SignedContractUpload from "./SignedContractUpload";

const rental: RentalContract = { id: 42, vehicleId: 8, rentalType: "longterm", status: "pre_inspection", isSubscription: false, vatPrice: 0, depositPrice: 0, overtimePrice: 0, totalPrice: 100000, contractLink: null, signedAt: null, hasUploadedContract: false };
beforeEach(() => vi.resetAllMocks());
function setup(overrides = {}) {
  const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const refresh = vi.fn().mockResolvedValue(undefined);
  render(<QueryClientProvider client={cache}><SignedContractUpload rental={{ ...rental, ...overrides }} refresh={refresh} /></QueryClientProvider>);
  return { cache, refresh };
}
const input = () => screen.getByLabelText("File hoặc ảnh hợp đồng đã ký (bắt buộc)") as HTMLInputElement;
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Lưu hợp đồng đã ký" }));
const choose = (file = new File(["%PDF-1.4 signed"], "hop-dong.pdf", { type: "application/pdf" })) => {
  fireEvent.change(input(), { target: { files: [file] } });
  fireEvent.change(screen.getByLabelText("Ngày giờ ký (bắt buộc)"), { target: { value: "2026-10-23T10:00" } });
  return file;
};

it("shows missing file and signature date inline before submitting", () => {
  setup(); submit();
  expect(screen.getByText("Vui lòng chọn file PDF hoặc ảnh hợp đồng đã ký.")).toBeVisible();
  expect(screen.getByText("Vui lòng chọn ngày giờ ký hợp đồng hợp lệ.")).toBeVisible();
  expect(input()).toHaveAttribute("aria-invalid", "true");
  expect(input()).toHaveAttribute("aria-describedby", expect.stringContaining("-error"));
  expect(api.uploadRentalContract).not.toHaveBeenCalled();
});

it.each([
  [new File(["exe"], "hop-dong.exe", { type: "application/x-msdownload" }), "Chỉ nhận file PDF, JPEG, PNG hoặc WebP. Vui lòng chọn lại file."],
  [new File([], "empty.pdf", { type: "application/pdf" }), "File hợp đồng đang trống. Vui lòng chọn file có nội dung."],
])("rejects an invalid file inline", (file, message) => {
  setup(); choose(file); submit();
  expect(screen.getByText(message)).toBeVisible();
  expect(api.uploadRentalContract).not.toHaveBeenCalled();
});

it("rejects files over 10 MB and clears only the edited error", () => {
  setup(); submit();
  const file = new File(["signed"], "large.pdf", { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 + 1 });
  fireEvent.change(input(), { target: { files: [file] } });
  expect(screen.getByText("File hợp đồng không được vượt quá 10 MB. Vui lòng chọn file nhỏ hơn.")).toBeVisible();
  expect(screen.getByText("Vui lòng chọn ngày giờ ký hợp đồng hợp lệ.")).toBeVisible();
});

it("uploads the selected file and GMT+7 signature time, preventing repeat submits", async () => {
  let resolve!: (value: RentalContract) => void;
  api.uploadRentalContract.mockReturnValue(new Promise<RentalContract>(done => { resolve = done; }));
  const { cache, refresh } = setup(); const file = choose(); submit();
  expect(screen.getByRole("button", { name: "Đang tải hợp đồng..." })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Đang tải hợp đồng..." }));
  expect(api.uploadRentalContract).toHaveBeenCalledExactlyOnceWith(42, file, "2026-10-23T03:00:00.000Z");
  const updated = { ...rental, hasUploadedContract: true, contractLink: "/api/rentals/42/contract/document", signedAt: "2026-10-23T03:00:00Z" };
  resolve(updated);
  await screen.findByText("Đã lưu hợp đồng đã ký.");
  expect(cache.getQueryData(["rental-contract", "42"])).toEqual(updated);
  expect(refresh).toHaveBeenCalledOnce();
});

it.each([
  [new TypeError("Failed to fetch"), "Không thể kết nối máy chủ. File và ngày giờ ký vẫn được giữ, vui lòng thử lại."],
  [new ApiClientError(400, "Bad Request", { error: { errors: { "request.File": ["Ảnh hợp đồng không đọc được. Vui lòng chọn ảnh rõ hơn."] } } }), "Ảnh hợp đồng không đọc được. Vui lòng chọn ảnh rõ hơn."],
])("keeps the file and date after API/network failure and allows retry", async (failure, message) => {
  api.uploadRentalContract.mockRejectedValue(failure);
  setup(); const file = choose(); submit();
  await screen.findByText(message);
  await waitFor(() => expect(screen.getByRole("button", { name: "Lưu hợp đồng đã ký" })).toBeEnabled());
  expect(input().files?.[0]).toBe(file);
  expect(screen.getByLabelText("Ngày giờ ký (bắt buộc)")).toHaveValue("2026-10-23T10:00");
  submit();
  await waitFor(() => expect(api.uploadRentalContract).toHaveBeenCalledTimes(2));
});

it("shows a protected download and locks file changes after handover", () => {
  setup({ status: "renting", hasUploadedContract: true, signedAt: "2026-10-23T03:00:00Z", contractLink: "/api/rentals/42/contract/document" });
  expect(screen.getByRole("link", { name: "Tải hợp đồng đã ký" })).toHaveAttribute("href", "/api/rentals/42/contract/document");
  expect(screen.queryByLabelText("File hoặc ảnh hợp đồng đã ký (bắt buộc)")).not.toBeInTheDocument();
});
