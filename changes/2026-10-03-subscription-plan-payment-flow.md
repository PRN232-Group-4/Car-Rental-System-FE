# 2026-10-03 — Flow mua gói qua PayOS (FE-09, ghép BE-21)

- **FR/NFR:** FR-023 (mua/gia hạn gói)
- **Loại:** feat

Ghép với thay đổi BE `2026-10-03-subscription-plan-payments.md` (repo `Car-Rental-System-BE`): mua gói giờ đi qua PayOS checkout + webhook, kết hợp với `GET /api/customer-subscriptions`.

## Đã làm

- **`features/subscriptions/api.ts`:** `purchaseSubscriptionPlan(planId)` gọi `POST /api/subscription-plans/{id}/purchase` và trả `PlanCheckoutResult { orderCode, paymentLinkId, checkoutUrl }` (BE tạo payment `pending` + link PayOS); thêm `getPlanPurchaseStatus(orderCode)` gọi `GET /api/subscription-plans/purchases/{orderCode}` để poll sau khi PayOS redirect về. Bỏ fallback mock "báo thành công giả" ở real mode.
- **`features/subscriptions/types.ts`:** thêm `PlanCheckoutResult`, `PlanPurchaseStatus`; bỏ `PurchasePlanResponse` (không còn dùng).
- **`SubscriptionPlans.tsx`:** sau khi lấy `checkoutUrl` thì `window.location.assign(checkoutUrl)` (dùng `assign` thay `location.href =` để không vướng lint `react-hooks/immutability` của React Compiler); nếu thiếu `checkoutUrl` thì báo lỗi thay vì báo thành công.
- **`app/(dashboard)/payment/result/page.tsx`:** nhận biết giao dịch mua gói qua `?type=subscription` (BE gắn vào `PayOs__ReturnUrl`) hoặc `orderCode >= 1_000_000_000`; poll `getPlanPurchaseStatus` mỗi 2.5s (tối đa 15 lần) song song với luồng hoá đơn cũ. UI theo nhánh: thành công → "Thanh toán gói thành công" + nút "Xem gói thuê của tôi"; huỷ/chờ → quay về `/subscriptions`.
- **`features/payments/types.ts` + `payment-history`:** `PaymentSummary.rentalId` chuyển thành nullable (payment mua gói có `rental_id = NULL`) và thêm type `subscription`; lịch sử hiển thị "Gói thuê bao" khi payment không gắn chuyến.
- **Mock:** `POST subscription-plans/{id}/purchase` trả `{ orderCode, paymentLinkId, checkoutUrl: "/payment/result?...&type=subscription&status=PAID" }`; thêm handler `GET subscription-plans/purchases/{orderCode}` trả `paid` để dev offline chạy được luồng.

## Test

- `npm run typecheck` xanh; `npm test` **24/24 pass** (đã cập nhật `mock-handlers.test.ts` theo response checkout mới); `npm run lint` 0 error; `npm run build` static export 15 route.

## Chưa làm

- **Gia hạn cộng dồn:** mua lại cùng gói tạo gói mới (không cộng giờ vào gói cũ) — giống hành vi BE hiện tại.
- **FE-28 (Google OAuth)** và **Playwright E2E** vẫn hoãn.

## Quyết định/giả định

- FE **không** tự xác nhận thanh toán: chỉ poll trạng thái do webhook BE ghi nhận.
- Nhận diện giao dịch mua gói bằng `type=subscription` trước, fallback theo ngưỡng `orderCode` — chịu được trường hợp PayOS không giữ query param của `returnUrl`.
- ⚠️ Cần đổi `PayOs__ReturnUrl`/`PayOs__CancelUrl` phía BE sang `https://<fe-host>/payment/result` (hiện còn placeholder).
