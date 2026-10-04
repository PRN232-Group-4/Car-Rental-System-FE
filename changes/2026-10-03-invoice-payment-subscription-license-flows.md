# 2026-10-03 — Hóa đơn, thanh toán, subscription & GPLX (FE-08, FE-09, FE-29)

- **FR/NFR:** FR-019..021 (invoice/payment), FR-022..025 (subscription), FR-029 (GPLX/Cloudinary)
- **Loại:** feat

## Đã làm

### 1. Dashboard shell

- `app/(dashboard)/layout.tsx`: sidebar + header dùng chung, nav (Đặt xe, Gói của tôi, Hóa đơn, Lịch sử thanh toán, GPLX), guard đăng nhập, menu mobile, nút đăng xuất.
- `hooks/use-mounted.ts` để tránh lệch hydration khi đọc trạng thái client.

### 2. Đặt xe — `app/(dashboard)/booking/page.tsx` (FR-024)

- Hai chế độ: **"Thuê trực tiếp"** và **"Dùng gói thuê bao"**.
- Gate GPLX: chế độ trực tiếp yêu cầu `license.status === "approved"` (khớp BE bắt buộc GPLX approved cho thuê trực tiếp).
- Gate hạn mức: chặn khi `remaining_hours < duration`, hiển thị cảnh báo; gửi `subscriptionId` khi thuê bằng gói.
- Trực tiếp → hoá đơn (điều hướng `/invoices`); dùng gói → **không** sang hoá đơn, invalidate query `my-subscriptions` để số giờ cập nhật ngay (P3.6/P4.5).
- Bắt lỗi BE `400 "not enough remaining hours"` / yêu cầu GPLX và hiển thị rõ.

### 3. Hóa đơn & thanh toán (FR-019..021)

- `app/(dashboard)/invoices/page.tsx`: danh sách + filter trạng thái + tìm kiếm.
- `app/(dashboard)/invoices/[id]/page.tsx` + `InvoiceDetailClient.tsx`: chi tiết, breakdown thuê/VAT/cọc, nút thanh toán → `POST /api/invoices/{id}/checkout` → `window.location = checkoutUrl` (PayOS). `generateStaticParams` cho static export.
- `app/(dashboard)/payment/result/page.tsx`: poll `GET /api/invoices/{id}` mỗi 2.5s tối đa 15 lần tới `paid`/timeout + nút "Kiểm tra lại" (webhook là server-side).
- `app/(dashboard)/payment-history/page.tsx`: ledger `GET /api/payments`, badge `paid/requested/refunded/rejected`, tổng đã trả/đã hoàn/cọc đang giữ.

### 4. Subscription khách hàng (FR-022..025)

- `app/(marketing)/subscriptions/page.tsx`: trang gói (tách từ section landing).
- `features/subscriptions/components/SubscriptionPlans.tsx`: card gói (giờ, hạn, giá/giờ), nút mua.
- `app/(dashboard)/my-subscriptions/page.tsx`: `GET /api/customer-subscriptions`, số giờ còn lại, phần trăm, badge `active/expired/depleted`, cảnh báo `< 5 giờ` / `< 3 ngày` (khớp email FR-025).

### 5. GPLX + Cloudinary (FR-029)

- `features/licenses/api.ts`: `GET/PUT /api/customer/license`; `compressImage` (canvas, tối đa 1600px, quality 0.85) và `uploadLicensePhoto` (Cloudinary unsigned khi có `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, fallback data URL).
- `app/(dashboard)/driver-license/page.tsx`: form GPLX, trạng thái `pending/approved/rejected`, preview + nén ảnh trước khi lưu.

### 6. Mock handlers

- `src/api/mock/mock-handlers.ts` + `mock-store.ts`: bổ sung route invoice/checkout, payments, `customer-subscriptions`, `subscription-plans/{id}/purchase`, `customer/license` (+upload) để dev offline chạy đủ luồng.

## Test

- `mock-handlers.test.ts`: health/facilities/vehicles/plans/rental/invoice/checkout/payments/subscriptions/license.
- `npm run typecheck` xanh; `npm test` 24/24; `npm run build` static export 15 route (gồm `/invoices/1|2|101` SSG).

## Chưa làm

- Huỷ đơn thuê từ UI (P6.3 dự kiến nằm trong E2E Playwright).
- Upload ảnh xe/avatar có chữ ký từ BE (`BE-39`) — hiện license dùng unsigned preset hoặc base64.

## Quyết định/giả định

- Cổng thanh toán dùng PayOS qua redirect + webhook server-side; FE chỉ poll trạng thái, không tự xác nhận thanh toán.
- Đơn thuê bằng gói không hiển thị bước hoá đơn (đúng nghiệp vụ FR-024).
