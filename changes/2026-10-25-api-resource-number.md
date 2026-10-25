# Đồng bộ tên API số ít/số nhiều — 2026-10-25

## Kết quả

- Cập nhật API adapters: resource có ID dùng số ít (`/api/customer/{id}`, `/api/vehicle/{id}`, `/api/rental/{id}`); collection giữ số nhiều. Nested resource áp dụng cùng quy tắc. Giữ singleton/action và tên `staff`/`media`.
- Đồng bộ 36 file mock e2e, test API và hai snapshot OpenAPI. Chỉ sửa API URL, giữ route điều hướng giao diện.
- Link tải hợp đồng dùng `/api/rental/{id}/contract/document`; backend chuẩn hóa URL cũ đã lưu, giữ trạng thái có hợp đồng.
- Không đổi form, kiểu dữ liệu, response envelope hoặc phân quyền. Backend và frontend cần phát hành đồng bộ vì URL cũ không còn alias.

## Kiểm chứng

- `npm run typecheck`: đạt.
- 12 file test API liên quan: **97/97 pass**, `vitest --maxWorkers=1` với TEMP/TMP tạm trong workspace.
- `git diff --check`: đạt; review độc lập FE calls/mock không thấy API URL cũ còn sót.
- Chưa chạy Playwright/browser suite hoặc deploy. Snapshot chỉ đổi tên URL trong phạm vi, không tái sinh các endpoint đã thiếu từ trước.

Quy tắc chi tiết và kiểm chứng BE: `Car-Rental-System-BE/docs/decisions/ADR-013-api-resource-number.md`, `Car-Rental-System-BE/changes/2026-10-25-file-consolidation-api-number.md` trong workspace chung.
