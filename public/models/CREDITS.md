# 3D Automotive Asset Credits & Licenses

Tất cả các mô hình xe 3D trong thư mục `public/models/` được tích hợp trong hệ thống Thong Dong theo đúng quy định tại `DESIGN.md` Mục A8 và chỉ phục vụ mục đích trình diễn WebGL Studio tương tác:

---

## 1. 1975 Porsche 911 (930) Turbo
- **Tệp gốc (Original):** `public/models/1975_porsche_911_930_turbo.glb` (21.97 MB, ~242k tam giác, 82 draw calls)
- **Tệp tối ưu (Derivative):** `public/models/1975_porsche_911_930_turbo_opt.glb` (1.81 MB, ~60k tam giác, 14 draw calls)
- **Tác giả gốc:** Karol Miklas (Sketchfab / Open Automotive 3D Community)
- **Giấy phép:** Creative Commons Attribution ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- **Mô tả:** Mẫu xe thể thao tăng áp huyền thoại đầu tiên của Porsche năm 1975, làm mát bằng không khí (Air-Cooled Turbo).
- **Nhật ký thay đổi kỹ thuật (Modifications & Derivatives under CC BY 4.0):**
  - Giản lược lưới đa giác (mesh decimation) từ ~242k tam giác xuống ~60k tam giác.
  - Nén hình học và lượng tử hóa tọa độ đỉnh với Meshopt (`EXT_meshopt_compression`, `KHR_mesh_quantization`).
  - Nén kết cấu vật liệu (textures) sang định dạng WebP (`EXT_texture_webp`), giảm VRAM GPU từ ~65 MB xuống ~22 MB.
  - Gộp các primitives đồng nhất để giảm draw calls từ 82 xuống 14; bảo toàn vật liệu thân xe `paint` phục vụ đổi màu xe tương tác.

---

## 2. Porsche 911 Carrera 4S (2026 Edition)
- **Tệp gốc (Original):** `public/models/porsche_911_carrera_4s.glb` (25.36 MB, ~540k tam giác, 45 draw calls)
- **Tệp tối ưu (Derivative):** `public/models/porsche_911_carrera_4s_opt.glb` (784 KB, ~48k tam giác, 16 draw calls)
- **Tác giả gốc:** Martin Trafas / 3D Automotive Design Lab
- **Giấy phép:** Creative Commons Attribution ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- **Mô tả:** Biểu tượng hiệu năng đương đại thế hệ mới, động cơ 3.0L Twin-Turbo Boxer 6 xi-lanh dẫn động 4 bánh toàn thời gian.
- **Nhật ký thay đổi kỹ thuật (Modifications & Derivatives under CC BY 4.0):**
  - Giản lược lưới đa giác từ ~540k tam giác xuống ~48k tam giác (giảm 91% số tam giác).
  - Nén hình học và lượng tử hóa thuộc tính đỉnh với Meshopt (`EXT_meshopt_compression`, `KHR_mesh_quantization`).
  - Nén toàn bộ kết cấu vật liệu sang WebP (`EXT_texture_webp`), giảm VRAM GPU từ ~80 MB xuống ~25 MB.
  - Gộp các meshes đồng chất để giảm draw calls từ 45 xuống 16 (-64%); bảo toàn định danh vật liệu thân xe `paint` để hỗ trợ đổi màu sơn xe ở runtime.
  - Kết xuất dẫn xuất bộ ảnh poster tĩnh trong suốt đa tầng (`public/assets/hero-car/hero-car-*.webp`, `hero-car-*.avif`) phục vụ hiển thị fallback trên thiết bị di động và môi trường không hỗ trợ WebGL theo quy tắc A8.

---

## Nguyên Tắc Hiển Thị & Dự Phòng (Fallback Rules)
Theo `DESIGN.md` Mục A8:
1. **Chỉ dùng 2 vị trí 3D trên toàn bộ ứng dụng:** `HeroShowroom3D` và `InteractiveStudio3D`. Tuyệt đối không lạm dụng 3D ở danh sách hay thẻ xe.
2. **Fallback tĩnh bắt buộc:** Khi WebGL bị vô hiệu hóa, GPU yếu, hoặc mất ngữ cảnh (`webglcontextlost`), hệ thống tự động rơi về ảnh poster tĩnh độ phân giải cao (`/assets/hero-car/hero-car-composite-*.webp` hoặc `/assets/hero-hai-van.jpg`). Tuyệt đối không dựng hình khối lập phương/hình trụ giả lập xe 3D.
3. **Tiết kiệm tài nguyên:** Render loop tự động tạm dừng (`cancelAnimationFrame`) khi phần tử cuộn ra ngoài khung nhìn (sử dụng `IntersectionObserver`).
