# 3D Automotive Asset Credits & Licenses

Tất cả các mô hình xe 3D trong thư mục `public/models/` được tích hợp trong hệ thống Thong Dong (VRS) theo đúng quy định tại `DESIGN.md` Mục A8 và chỉ phục vụ mục đích trình diễn WebGL Studio tương tác:

---

## 1. 1975 Porsche 911 (930) Turbo
- **Tệp:** `1975_porsche_911_930_turbo.glb`
- **Tác giả gốc:** Karol Miklas (Sketchfab / Open Automotive 3D Community)
- **Giấy phép:** Creative Commons Attribution ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- **Mô tả:** Mẫu xe thể thao tăng áp huyền thoại đầu tiên của Porsche năm 1975, làm mát bằng không khí (Air-Cooled Turbo). Tối ưu hóa lưới đa giác (polygon count) và nén Draco / GLB để nạp nhanh trên trình duyệt web.

---

## 2. Porsche 911 Carrera 4S (2026 Edition)
- **Tệp:** `porsche_911_carrera_4s.glb`
- **Tác giả gốc:** Martin Trafas / 3D Automotive Design Lab
- **Giấy phép:** Creative Commons Attribution ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- **Mô tả:** Biểu tượng hiệu năng đương đại thế hệ mới, động cơ 3.0L Twin-Turbo Boxer 6 xi-lanh dẫn động 4 bánh toàn thời gian. Sử dụng PBR materials (Roughness, Metallic, Clearcoat) tương thích WebGL / Three.js PBR Pipeline.

---

## Nguyên Tắc Hiển Thị & Dự Phòng (Fallback Rules)
Theo `DESIGN.md` Mục A8:
1. **Chỉ dùng 2 vị trí 3D trên toàn bộ ứng dụng:** `HeroShowroom3D` và `InteractiveStudio3D`. Tuyệt đối không lạm dụng 3D ở danh sách hay thẻ xe.
2. **Fallback tĩnh bắt buộc:** Khi WebGL bị vô hiệu hóa, GPU yếu, hoặc mất ngữ cảnh (`webglcontextlost`), hệ thống tự động rơi về ảnh poster tĩnh độ phân giải cao (`/assets/hero-hai-van.jpg` hoặc `/assets/hero-ev.jpg`). Tuyệt đối không dựng hình khối lập phương/hình trụ giả lập xe 3D.
3. **Tiết kiệm tài nguyên:** Render loop tự động tạm dừng (`cancelAnimationFrame`) khi phần tử cuộn ra ngoài khung nhìn (sử dụng `IntersectionObserver`).
