# Open Questions & Pending Backend Contracts

Tài liệu này lưu trữ các câu hỏi mở, giả định thiết kế và hợp đồng API đề xuất gửi Backend team (Single Source of Truth cho các module chưa có endpoint BE thực tế).

---

## 1. Hợp đồng đề xuất cho BE-34 — Đánh giá nhân viên / Tài xế (Gửi: Kiệt)

* **Module FE:** FE-25 (Admin Staff Reviews / Quản trị đánh giá nhân sự & tài xế)
* **Người thực hiện FE:** Huy
* **Trạng thái BE hiện tại:** BE-34 chưa bắt đầu. Bảng `staff_reviews` chưa có trong DDL (chỉ có cột `staffs.rating NUMERIC(3,2)`).
* **Mô hình triển khai:** FE đã hoàn tất lớp adapter và mock-first 100% theo hợp đồng đề xuất dưới đây. Khi BE-34 hoàn thành, chỉ cần cập nhật API layer mà không phải sửa đổi giao diện hoặc logic nghiệp vụ.

### 1.1 Cấu trúc cơ sở dữ liệu đề xuất
Bảng `staff_reviews`:
* `id` (SERIAL PRIMARY KEY)
* `rental_id` (INT NOT NULL REFERENCES rentals(id))
* `customer_id` (INT NOT NULL REFERENCES users(id))
* `staff_id` (INT NOT NULL REFERENCES staffs(id)) — tài xế hoặc nhân viên vận hành được đánh giá
* `rating` (INT NOT NULL CHECK (rating BETWEEN 1 AND 5))
* `comment` (TEXT, tối đa 1000 ký tự)
* `status` (VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden', 'reported')))
* `hidden_reason` (TEXT NULL) — lý do ẩn kiểm duyệt bắt buộc
* `hidden_by` (INT NULL REFERENCES users(id))
* `hidden_at` (TIMESTAMPTZ NULL)
* `reply` (TEXT NULL, tối đa 1000 ký tự) — phản hồi chính thức từ quản trị viên/quản lý
* `replied_by` (INT NULL REFERENCES users(id))
* `replied_at` (TIMESTAMPTZ NULL)
* `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

**Ràng buộc & Quy tắc:**
1. Ràng buộc UNIQUE (`rental_id`, `staff_id`): Mỗi khách hàng chỉ được gửi 1 đánh giá cho 1 nhân sự trên 1 đơn thuê.
2. Chỉ cho phép đánh giá đơn thuê có trạng thái `completed`.
3. Điểm `staffs.rating` là **trung bình cộng của tất cả đánh giá có `status = 'visible'`**. Đánh giá bị ẩn (`hidden`) không được tính vào điểm số.

### 1.2 Danh mục Endpoint đề xuất (Role: Admin, Manager)
1. `GET /api/admin/reviews`
   - **Query params:** `search`, `staffId`, `rating` (1–5), `status` (`visible` | `hidden` | `reported`), `hasReply` (boolean), `page` (default: 1), `pageSize` (default: 20).
   - **Response Envelope:**
     ```json
     {
       "code": 200,
       "status": "success",
       "is_success": true,
       "data": {
         "items": [
           {
             "id": 1,
             "rating": 5,
             "commentPreview": "Tài xế lái xe rất cẩn thận...",
             "status": "visible",
             "createdAt": "2026-10-14T08:30:00Z",
             "staff": { "id": 12, "fullName": "Nguyễn Văn Tài", "isDriver": true, "avatarUrl": null },
             "customerName": "Trần Thị Bích",
             "rentalId": 1045,
             "hasReply": true
           }
         ],
         "page": 1,
         "pageSize": 20,
         "totalCount": 48
       }
     }
     ```
2. `GET /api/admin/reviews/{id}`
   - Chi tiết đánh giá, bao gồm `comment` đầy đủ, `reply`, `hiddenInfo`, `rental` context và `impact` (điểm trung bình trước/sau khi ẩn nếu có).
3. `POST /api/admin/reviews/{id}/hide`
   - **Body:** `{ "reason": "Lý do ẩn bắt buộc..." }`
   - Cập nhật `status = 'hidden'`, lưu `hidden_reason`, `hidden_by`, `hidden_at`. Tính lại `staffs.rating`.
4. `POST /api/admin/reviews/{id}/unhide`
   - Cập nhật `status = 'visible'`. Tính lại `staffs.rating`.
5. `POST /api/admin/reviews/{id}/reply`
   - **Body:** `{ "replyText": "Nội dung phản hồi từ 5 đến 1000 ký tự..." }`
   - Lưu `reply`, `replied_by`, `replied_at`.
6. `GET /api/staff/{id}/rating-summary`
   - **Response:**
     ```json
     {
       "average": 4.82,
       "count": 45,
       "distribution": { "5": 38, "4": 5, "3": 1, "2": 1, "1": 0 }
     }
     ```

### 1.3 Câu hỏi nghiệp vụ cần xác nhận
* **Q1:** Một chuyến đi có cả nhân viên bàn giao xe và tài xế riêng thì khách hàng đánh giá tách biệt 2 đối tượng hay chỉ đánh giá tài xế? (FE hiện tại hỗ trợ theo `staffId`).
* **Q2:** Thời hạn phản hồi đánh giá và sửa phản hồi: Có giới hạn trong vòng 24h hay cho phép chỉnh sửa bất cứ lúc nào? (FE hiện tại cho phép phản hồi và sửa lại phản hồi).
