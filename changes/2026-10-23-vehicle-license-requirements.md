# Hiển thị bằng lái yêu cầu theo xe

- Card xe trong tìm kiếm, trang chủ và biểu mẫu chọn xe hiển thị `Tự lái: GPLX …` từ `allowedLicenseTypes` của chính xe đó.
- Trang chi tiết đặt yêu cầu bằng lái ngay dưới tên xe và địa điểm nhận xe. Khi có nhiều hạng, giải thích chỉ cần một trong các hạng được liệt kê; không suy diễn quan hệ giữa các hạng bằng.
- Dùng chung `VehicleLicenseRequirement`; danh sách nhiều hạng được xuống dòng, không cắt chữ. Trạng thái thiếu dữ liệu ghi yêu cầu đang cập nhật, không ghi mọi hạng hay không cần bằng.
- Giữ nguyên quyền, API, bộ lọc xe chưa cấu hình và luồng đặt xe. Trong thẻ chọn xe, yêu cầu GPLX nằm trong mô tả hỗ trợ đọc màn hình của radio.
- Kiểm thử: component với một/nhiều/thiếu hạng; card tìm xe, chi tiết và xe tương tự, mô tả radio đặt xe, card landing và đổi xe trong showcase.
