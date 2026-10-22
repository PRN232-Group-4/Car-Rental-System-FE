# Sửa cuộn lên/xuống trong workspace đơn thuê

Khung desktop bị cố định height:100dvh/overflow:hidden, cùng các panel cuộn lồng và overscroll contain, khiến cuộn phụ thuộc vị trí con trỏ và có thể bị kẹt ở cuối vùng chi tiết. Nay shell, stage, hồ sơ và bảng lệnh theo chiều cao nội dung, dùng thanh cuộn của trang ở mọi kích thước. Bỏ primary sticky để không bị header dính che. Hàng đợi vẫn có thanh cuộn riêng và overscroll auto để truyền cuộn ra trang khi tới biên.

Giữ bố cục: ba cột ở workspace lớn, danh sách trái/chi tiết phải ở kích thước trung gian, xếp dọc trên điện thoại. Không đổi API, phân quyền, inspect, thanh toán hoặc trạng thái thuê. Popup vẫn khóa cuộn khi mở và khôi phục sau đóng như component FormDialog hiện hành.

Kiểm chứng: 18 Edge E2E đạt, gồm con lăn xuống/lên từ vùng nội dung, vùng trống, từ hàng đợi đã cuộn tới cuối, anchor nút trả xe, và cuộn sau đóng popup thanh toán. Các độ rộng 1920, 1600, 1440, 1280, 1220, 1180, 1024, 768, 390, 320px; kiểm tra theme sáng/tối và không tràn ngang. TypeScript/design lint đạt. Chỉ sửa source FE, chưa deploy.
