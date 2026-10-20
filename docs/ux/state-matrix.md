# Ma Trận Trạng Thái Toàn Bộ Tuyến Đường (State Matrix) — FE-20

> Tài liệu này lập danh mục toàn bộ các route thực tế trong hệ thống Thong Dong VRS (`src/app/**`) và đối soát 4 trạng thái cốt lõi: **Loading**, **Empty**, **Error**, **Populated** theo yêu cầu `docs/specs/FE-20-ux-polish.md` (Hạng mục A).
>
> **Quy chuẩn trạng thái:**
> - **Loading:** Skeleton đúng tỷ lệ nội dung thật (không spinner toàn trang, không trang trắng).
> - **Empty:** Minh họa SVG đơn sắc + tiêu đề tiếng Việt + hướng dẫn + nút hành động (không chỉ ghi "No data").
> - **Error:** Thông điệp thân thiện + nút "Thử lại" + hiển thị `traceId` cho nhân viên/quản trị.
> - **Populated:** Dữ liệu hoàn chỉnh hiển thị đúng token v3.1.

| # | Route | File Nguồn | Loading | Empty | Error | Populated | Ghi chú & Đánh giá |
|---|---|---|---|---|---|---|---|
| 1 | `/` | `src/app/(marketing)/page.tsx` | THIẾU | THIẾU | THIẾU | ĐẠT | Cần bổ sung: loading skeleton, empty state, error recovery / traceId |
| 2 | `/account/trips` | `src/app/(dashboard)/account/trips/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 3 | `/account/trips/detail` | `src/app/(dashboard)/account/trips/detail/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 4 | `/admin` | `src/app/admin/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 5 | `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 6 | `/admin/departments` | `src/app/admin/departments/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 7 | `/admin/dispatch` | `src/app/admin/dispatch/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 8 | `/admin/drivers/schedule` | `src/app/admin/drivers/schedule/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 9 | `/admin/facilities` | `src/app/admin/facilities/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 10 | `/admin/inspections` | `src/app/admin/inspections/page.tsx` | ĐẠT | THIẾU | ĐẠT | ĐẠT | Cần bổ sung: empty state |
| 11 | `/admin/maintenance` | `src/app/admin/maintenance/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 12 | `/admin/policies` | `src/app/admin/policies/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 13 | `/admin/profile` | `src/app/admin/profile/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 14 | `/admin/rentals` | `src/app/admin/rentals/page.tsx` | ĐẠT | THIẾU | ĐẠT | ĐẠT | Cần bổ sung: empty state |
| 15 | `/admin/reports` | `src/app/admin/reports/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 16 | `/admin/reports/detail` | `src/app/admin/reports/detail/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 17 | `/admin/reviews` | `src/app/admin/reviews/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 18 | `/admin/reviews/detail` | `src/app/admin/reviews/detail/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 19 | `/admin/roles` | `src/app/admin/roles/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 20 | `/admin/staffs` | `src/app/admin/staffs/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 21 | `/admin/staffs/detail` | `src/app/admin/staffs/detail/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 22 | `/admin/staffs/new` | `src/app/admin/staffs/new/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 23 | `/admin/subscription-plans` | `src/app/admin/subscription-plans/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 24 | `/admin/users` | `src/app/admin/users/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 25 | `/admin/users/detail` | `src/app/admin/users/detail/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 26 | `/admin/vehicle-types` | `src/app/admin/vehicle-types/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 27 | `/admin/vehicles` | `src/app/admin/vehicles/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 28 | `/admin/vehicles/edit` | `src/app/admin/vehicles/edit/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 29 | `/admin/vehicles/new` | `src/app/admin/vehicles/new/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 30 | `/booking` | `src/app/(dashboard)/booking/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 31 | `/driver-license` | `src/app/(dashboard)/driver-license/page.tsx` | THIẾU | ĐẠT | ĐẠT | ĐẠT | Cần bổ sung: loading skeleton |
| 32 | `/facilities` | `src/app/(marketing)/facilities/page.tsx` | THIẾU | THIẾU | THIẾU | ĐẠT | Cần bổ sung: loading skeleton, empty state, error recovery / traceId |
| 33 | `/find` | `src/app/(marketing)/find/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 34 | `/forbidden` | `src/app/forbidden/page.tsx` | ĐẠT | ĐẠT | THIẾU | ĐẠT | Cần bổ sung: error recovery / traceId |
| 35 | `/forgot-password` | `src/app/forgot-password/page.tsx` | THIẾU | ĐẠT | ĐẠT | ĐẠT | Cần bổ sung: loading skeleton |
| 36 | `/invoices` | `src/app/(dashboard)/invoices/page.tsx` | ĐẠT | ĐẠT | THIẾU | ĐẠT | Cần bổ sung: error recovery / traceId |
| 37 | `/invoices/[id]` | `src/app/(dashboard)/invoices/[id]/page.tsx` | THIẾU | THIẾU | THIẾU | ĐẠT | Cần bổ sung: loading skeleton, empty state, error recovery / traceId |
| 38 | `/login` | `src/app/login/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 39 | `/my-subscriptions` | `src/app/(dashboard)/my-subscriptions/page.tsx` | ĐẠT | ĐẠT | THIẾU | ĐẠT | Cần bổ sung: error recovery / traceId |
| 40 | `/payment-history` | `src/app/(dashboard)/payment-history/page.tsx` | ĐẠT | ĐẠT | THIẾU | ĐẠT | Cần bổ sung: error recovery / traceId |
| 41 | `/payment/result` | `src/app/(dashboard)/payment/result/page.tsx` | ĐẠT | ĐẠT | THIẾU | ĐẠT | Cần bổ sung: error recovery / traceId |
| 42 | `/profile` | `src/app/profile/page.tsx` | THIẾU | ĐẠT | THIẾU | ĐẠT | Cần bổ sung: loading skeleton, error recovery / traceId |
| 43 | `/register` | `src/app/register/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 44 | `/rental-contract` | `src/app/(dashboard)/rental-contract/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 45 | `/report-incident` | `src/app/(dashboard)/report-incident/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 46 | `/result` | `src/app/result/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 47 | `/staff` | `src/app/staff/page.tsx` | THIẾU | THIẾU | THIẾU | ĐẠT | Cần bổ sung: loading skeleton, empty state, error recovery / traceId |
| 48 | `/staff/profile` | `src/app/staff/profile/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 49 | `/staff/revenue` | `src/app/staff/revenue/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 50 | `/staff/shifts` | `src/app/staff/shifts/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 51 | `/staff/vehicles` | `src/app/staff/vehicles/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |
| 52 | `/subscriptions` | `src/app/(marketing)/subscriptions/page.tsx` | THIẾU | THIẾU | ĐẠT | ĐẠT | Cần bổ sung: loading skeleton, empty state |
| 53 | `/vehicles` | `src/app/(marketing)/vehicles/page.tsx` | ĐẠT | THIẾU | ĐẠT | ĐẠT | Cần bổ sung: empty state |
| 54 | `/vehicles/detail` | `src/app/(marketing)/vehicles/detail/page.tsx` | ĐẠT | ĐẠT | ĐẠT | ĐẠT | Đầy đủ trạng thái |

---

## Tổng kết Đánh giá Ban đầu (Trước khi sửa)
- **Tổng số routes rà soát:** 54
- **Số route đã đầy đủ 4 trạng thái:** 38 / 54
- **Số route phát hiện còn thiếu sót trạng thái:** 16
- **Kế hoạch khắc phục (Hạng mục A):**
  1. Chuẩn hóa ở các component dùng chung: `Skeleton.tsx` (`AdminTableSkeleton`, `FormSkeleton`, `SkeletonCard`), `EmptyState.tsx` và `ErrorState.tsx` (hỗ trợ `traceId` và `onRetry`).
  2. Bổ sung `error.tsx` và `global-error.tsx` cho toàn bộ cây App Router.
  3. Cập nhật các trang danh sách/chi tiết chưa có xử lý lỗi truy vấn API sang sử dụng component chuẩn.
