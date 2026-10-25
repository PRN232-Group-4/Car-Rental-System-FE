# Log server API trong development

Next dev ghi `[API proxy]` ở terminal với upstream origin và nguồn cấu hình DEV_API_ORIGIN/BACKEND_ORIGIN/Railway mặc định. Expose riêng origin đã loại credentials/query cho browser diagnostics ở development. ApiClient ghi `[API server]` ở Console lần đầu gọi mỗi đích, gồm requestOrigin/backendOrigin/via; NEXT_PUBLIC_API_URL trỏ trực tiếp được phân biệt với proxy /api. Không thay URL/request/response/error handling.

Chỉ bật khi NODE_ENV=development. Không log path/query/body/cookie/header/token; diagnostics lỗi không làm hỏng request. Production Worker không được suy đoán upstream từ cấu hình dev. Đổi env cần khởi động lại next dev. Hướng dẫn tại docs/dev-guide.md.

Kiểm chứng: 22 unit tests gồm proxy/direct target, loại bỏ credentials/query, tránh log lặp, tắt ở production/test và regression ApiClient đạt. TypeScript và ESLint các file liên quan đạt. Chưa deploy.
