# Hồ sơ customer: giới tính và trạng thái GPLX

- Chọn Nam/Nữ/Khác hoặc bỏ lựa chọn không làm trang lỗi; giữ các giá trị API `Male`/`Female`/`Other`/rỗng. Lấy giá trị sự kiện trước callback cập nhật state, xóa thông báo lưu cũ khi sửa.
- GPLX chưa có số (null/rỗng/khoảng trắng) hoặc trạng thái `none` là chưa gửi, kể cả backend cũ trả `pending`. Áp dụng `/profile` và `/driver-license`; không đánh dấu đã gửi/chờ duyệt và vẫn cho gửi hồ sơ lần đầu.
- Hồ sơ có số GPLX giữ trạng thái thật. Sau gửi thành công mới đánh dấu đã gửi/chờ duyệt.
- Giữ validation inline tiếng Việt, dữ liệu khi lỗi API/mạng và xóa riêng lỗi trường vừa sửa.

Acceptance được kiểm tra bằng ProfileManager.test.tsx, LicenseForms.test.tsx, booking-license.test.ts và customer-profile-regressions.spec.ts (desktop/mobile, API giả lập).

Đối chiếu backend FR-005/FR-006: GET GPLX chưa có số trả `none`; FE tương thích cả backend cũ. Không sửa/xóa GPLX đã lưu.
