# Giữ phương tiện đã chọn từ danh mục tới đặt xe

- Thẻ xe `/find` chuyển đúng ID xe, cơ sở thực của xe, lịch thuê và hình thức thuê sang `/vehicles/detail`.
- Trang chi tiết khởi tạo lịch và hình thức thuê từ URL; lịch chọn trên tab lịch trống cập nhật lại thẻ đặt xe. Giờ nhận/trả giữ đúng GMT+7.
- CTA đặt xe chuyển cả `vehicleId` và `facilityId`, tránh biểu mẫu buộc khách chọn lại cơ sở rồi chọn lại xe.
- URL đặt xe cũ chỉ có `vehicleId` tự tra cứu cơ sở từ API chi tiết xe. Giá, phương tiện khả dụng và chính sách vẫn lấy từ API, không dùng giá trong query hoặc giá snapshot chi tiết.
- Giữ xe đã chọn khi đổi hình thức lái/thuê nếu xe vẫn thuộc kết quả khả dụng mới; đổi cơ sở sẽ bỏ chọn xe. Xe không còn khả dụng không được gửi đặt thuê.
- Chính sách theo loại xe chỉ tải sau khi nhận được xe thực tế từ kết quả khả dụng, tránh cache kết quả rỗng trước khi danh sách tải xong.

Kiểm tra: TypeScript đạt; ESLint các file đã sửa đạt; 8 kiểm thử Vitest trong `BookingForm.selected-vehicle.test.tsx`, `BookingForm.license.test.tsx`, `SelectedVehicleContext.test.tsx` đạt. E2E bổ sung tại `e2e/selected-vehicle-context.spec.ts` bao phủ hành trình desktop/mobile, tải lại và liên kết trực tiếp (API giả lập, không tạo dữ liệu thật).
