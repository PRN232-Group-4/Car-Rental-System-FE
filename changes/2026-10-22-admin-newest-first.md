# Danh sách Admin mặc định mới nhất trước

- Phòng ban, loại xe và gói: sắp toàn bộ dữ liệu API trả về theo ID giảm dần. Danh mục không có ngày tạo trong contract dùng ID làm thứ tự tạo; không sort riêng từng trang.
- Cơ sở: gom đủ các trang rồi xếp ID giảm dần, tương thích backend cũ trả theo tên.
- Nhân viên mặc định theo ID giảm dần trước chia trang FE, không còn theo ngày vào làm; giữ sort theo tên/email/rating/ngày vào làm khi được chỉ định. Backend cũng đã đổi ORDER BY trước phân trang.
- Xe, customer/GPLX, vai trò được sửa SQL backend; các list vốn mới nhất trước giữ nguyên. Lịch/ca và dashboard giữ thứ tự nghiệp vụ.
- 14/14 unit test liên quan đạt (dữ liệu nhiều trang, tên/ngày vào làm ngược với thứ tự tạo, explicit sort, không mutate response), TypeScript và ESLint đạt. Không đổi layout/form. Backend cần khởi động lại để áp dụng SQL mới; chưa deploy.
