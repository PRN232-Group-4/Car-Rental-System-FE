# Khôi phục hàng đợi trái và hồ sơ phải

Bố cục cũ tự chuyển thành một cột khi viewport ≤1200px hoặc container ≤1120px, khiến danh sách đơn nằm trên chi tiết ngay cả trên cửa sổ máy tính. Workspace nay giữ hai cột ở container 640–1200px: hàng đợi bên trái, hồ sơ và bảng lệnh nối tiếp bên phải. Khi shell có chiều cao cố định, vùng phải cuộn chung để các nút vẫn tiếp cận được. Container lớn hơn giữ ba cột; dưới 640px xếp dọc cho điện thoại. Hàng đợi có thanh cuộn riêng, các panel không gây tràn ngang.

Chỉ thay bố cục và wrapper trình bày, giữ API, phân quyền, bộ lọc và thao tác đơn thuê hiện hữu. Đồng bộ quy chuẩn tại docs/admin-ui.md và DESIGN.md.

Kiểm chứng: 9 Edge E2E đạt ở 1920, 1600, 1280, 1220, 1180, 1024, 768, 390 và 320px; bao gồm sáng/tối, vị trí trái/phải, chọn đơn cập nhật chi tiết, cuộn tới cuối danh sách và bảng lệnh. TypeScript/design lint đạt. Đã xem ảnh 1024px, 768px và 1220px. Chỉ sửa source FE, chưa deploy.
