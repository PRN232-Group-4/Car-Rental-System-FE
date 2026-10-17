# ADR-001: Chiến Lược Quốc Tế Hóa (i18n Strategy) Cho Hệ Thống Thong Dong (VRS)

- **Trạng thái:** Được chấp thuận (Accepted)
- **Ngày quyết định:** 17/10/2026
- **Tác giả:** Huy (Lead Frontend Engineer - FE-20)
- **Các bên liên quan:** Product Owner, Team PRN232, Phúc (FE-21/22)

---

## 1. Bối Cảnh (Context)

Hệ thống Vehicle Rental System (VRS, thương hiệu Thong Dong) là nền tảng quản lý và cho thuê xe tự sở hữu tại thị trường Việt Nam (Hà Nội, TP.HCM, Đà Lạt, Đà Nẵng).
Theo đặc tả nghiệp vụ `docs/SRS_CarRental.md` (SRS v2.0): *"Ứng dụng đa ngôn ngữ là tính năng nằm ngoài phạm vi cốt lõi của giai đoạn hiện tại"*.
Đặc tả kỹ thuật `docs/specs/FE-20-ux-polish.md` (Mục I) quy định rõ:
> *"Chỉ triển khai nếu chủ dự án xác nhận mở rộng phạm vi... Nếu chưa: chỉ rà soát để mọi chuỗi UI nằm trong module có thể trích xuất, KHÔNG thêm thư viện i18n."*

Hệ thống frontend đang sử dụng Next.js 16 với kiến trúc Static Export (`output: "export"`). Việc tích hợp các thư viện i18n có định tuyến locale phụ thuộc vào middleware/server-side runtime (như `next-intl` App Router routing) sẽ xung đột trực tiếp với mô hình static export và làm phình to dung lượng bundle JavaScript vượt ngân sách 180 KB gzip.

---

## 2. Quyết Định (Decision)

1. **Không cài đặt thêm thư viện i18n bên thứ ba:** Tuyệt đối không thêm `next-intl`, `react-intl`, `i18next`, hay `lingui` vào `package.json` và `package-lock.json`.
2. **Ngôn ngữ mặc định duy nhất:** Tiếng Việt (`lang="vi"`) là ngôn ngữ vận hành và hiển thị duy nhất trên toàn bộ giao diện khách hàng và cổng quản trị.
3. **Chuẩn hóa chuỗi hiển thị theo từ điển thuật ngữ:** Tất cả các danh xưng, trạng thái, nút bấm, thông báo lỗi phải tuân thủ nghiêm ngặt từ điển thuật ngữ chuẩn tại `docs/ux/glossary.md`.
4. **Sẵn sàng trích xuất (Extraction-Ready Architecture):**
   - Các nhãn, options, thông điệp phản hồi được tổ chức dưới dạng module constants (ví dụ: `SORT_OPTIONS`, `TRANSMISSION_OPTIONS`, `STATUS_LABELS`, `API_ERROR_MESSAGES`).
   - Định dạng tiền tệ và ngày giờ luôn sử dụng API bản địa chuẩn `Intl.NumberFormat("vi-VN")` và `Intl.DateTimeFormat("vi-VN")` theo múi giờ GMT+7, không ghép chuỗi thủ công.

---

## 3. Hệ Quả & Lợi Ích (Consequences & Benefits)

- **Ưu điểm:**
  - Giữ bundle JavaScript cực nhẹ (đạt ngân sách < 180 KB gzip).
  - Tương thích 100% với Next.js 16 static export không cần Node.js SSR server.
  - Loại bỏ hoàn toàn độ trễ bất đồng bộ khi tải tệp bản dịch JSON.
  - Không có rủi ro xung đột Hydration Mismatch liên quan đến locale.
- **Hạn chế:**
  - Khi chủ dự án quyết định hỗ trợ khách du lịch quốc tế (tiếng Anh), sẽ cần một đợt trích xuất khóa (`t('...')`) và cấu hình bộ từ điển tĩnh không routing.
