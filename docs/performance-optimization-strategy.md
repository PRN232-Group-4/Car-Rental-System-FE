# Đề Xuất Chiến Lược Tối Ưu Performance — Car Rental System

> **Tài liệu tham chiếu:** Kế hoạch và các giải pháp kỹ thuật nâng cao hiệu năng toàn diện cho hệ sinh thái Thong Dong (Frontend Next.js, Cloudflare Worker Edge Proxy, và Backend ASP.NET Core Web API).  
> **Ngày lập:** 2026-10-12  

---

## 1. Frontend (Next.js & Browser Rendering)

### 1.1. Dynamic Import & Lazy Loading khối 3D WebGL (Ưu tiên cao nhất)
- **Hiện trạng:** `InteractiveStudio3D` và toàn bộ thư viện `three` (~600KB JS sau nén) đang được bundle trực tiếp vào First Load JS của Landing Page (`/`).
- **Giải pháp:** Sử dụng `next/dynamic` với tùy chọn `ssr: false`:
  ```tsx
  // src/app/(marketing)/page.tsx
  import dynamic from "next/dynamic";

  const InteractiveStudio3D = dynamic(
    () => import("@/features/landing/components/InteractiveStudio3D"),
    {
      ssr: false,
      loading: () => <div className="min-h-[540px] rounded-3xl bg-surface-raised border border-line animate-pulse" />
    }
  );
  ```
- **Hiệu quả kỳ vọng:**
  - Giảm ngay **40–50%** kích thước bundle JS tải ban đầu.
  - Cải thiện đáng kể chỉ số **LCP (Largest Contentful Paint)** và **TBT (Total Blocking Time)** trên thiết bị di động.

### 1.2. Tối ưu nén tài nguyên 3D Models (`.glb`)
- **Hiện trạng:** Tệp mô hình 3D Porsche (`/models/*.glb`) có kích thước tương đối lớn.
- **Giải pháp:**
  - Nén hình học mô hình bằng thuật toán **Draco Mesh Compression** qua lệnh CLI:
    ```bash
    npx gltf-pipeline -i public/models/porsche_911_carrera_4s.glb -o public/models/porsche_911_carrera_4s_draco.glb -d
    ```
  - Cắt giảm dung lượng texture xuống tối đa 1024x1024 hoặc 2048x2048 định dạng WebP/KTX2.
- **Hiệu quả kỳ vọng:** Giảm dung lượng tải file 3D từ 15–25MB xuống còn **2–4MB** (giảm 80% thời gian chờ tải mô hình).

### 1.3. Cấu hình Stale-Time cho TanStack Query (Server State Caching)
- **Hiện trạng:** `QueryClient` hiện để mặc định `staleTime: 0`, dẫn đến việc người dùng chỉ cần chuyển tab trình duyệt hoặc điều hướng qua lại là toàn bộ API danh mục lại bị gọi lại liên tục.
- **Giải pháp:** Cấu hình `staleTime` hợp lý cho các tài nguyên ít biến động:
  ```ts
  // src/components/providers/QueryProvider.tsx
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 phút cho dữ liệu thông thường (vehicles, facilities, plans)
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false, // Tránh refetch không cần thiết khi người dùng đổi tab
    }
  }
  ```

---

## 2. Edge & Networking (Cloudflare Worker Proxy)

### 2.1. Edge Caching cho API Public (Read-Only)
- **Hiện trạng:** Mọi request `/api/*` qua `worker/index.ts` đều fetch trực tiếp về upstream backend tại Railway.
- **Giải pháp:** Tận dụng **Cloudflare Cache API** (`caches.default`) để cache các endpoint đọc công khai trong 60–120 giây:
  - `GET /api/vehicles`
  - `GET /api/facilities`
  - `GET /api/subscription-plans`
  - `GET /api/rental-policies`
- **Mã triển khai mẫu:**
  ```ts
  // worker/index.ts
  const cache = caches.default;
  const isCacheable = request.method === "GET" && 
    ["/api/vehicles", "/api/facilities", "/api/subscription-plans"].some(p => url.pathname.startsWith(p));

  if (isCacheable) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
  }

  // Khi fetch upstream thành công:
  if (isCacheable && upstream.status === 200) {
    const responseToCache = upstream.clone();
    responseToCache.headers.set("Cache-Control", "public, max-age=60");
    await cache.put(request, responseToCache);
  }
  ```
- **Hiệu quả kỳ vọng:** Tốc độ phản hồi danh mục xe/trạm giảm từ **250–500ms** xuống còn **< 25ms** (ngay tại edge node gần người dùng nhất).

---

## 3. Backend (ASP.NET Core & Database)

### 3.1. Đánh Index bổ sung cho PostgreSQL (Npgsql Raw SQL)
- **Hiện trạng:** Backend sử dụng Npgsql thuần (không dùng EF Core), hiệu năng truy vấn phụ thuộc 100% vào Index của bảng.
- **Giải pháp:** Thêm chỉ mục cho các trường thường xuyên `WHERE` và `ORDER BY`:
  ```sql
  -- Index phục vụ lọc và tìm kiếm xe
  CREATE INDEX IF NOT EXISTS idx_vehicles_status_facility ON vehicles(status, facility_id);
  CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type_id);

  -- Index phục vụ danh sách đơn thuê và lịch trình
  CREATE INDEX IF NOT EXISTS idx_rentals_user_status ON rentals(user_id, status);
  CREATE INDEX IF NOT EXISTS idx_rentals_timerange ON rentals(start_time, end_time);

  -- Index đối soát thanh toán PayOS
  CREATE INDEX IF NOT EXISTS idx_payments_order_code ON payments(order_code);
  CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
  ```

### 3.2. Bật HTTP Response Compression (Brotli / Gzip)
- **Giải pháp:** Kích hoạt Middleware nén phản hồi JSON ở `VehicleRental.WebApi/Program.cs`:
  ```csharp
  builder.Services.AddResponseCompression(options =>
  {
      options.EnableForHttps = true;
      options.Providers.Add<BrotliCompressionProvider>();
      options.Providers.Add<GzipCompressionProvider>();
  });
  // ...
  app.UseResponseCompression();
  ```
- **Hiệu quả kỳ vọng:** Giảm kích thước payload của các API trả về danh sách lớn (`GET /api/vehicles`, `GET /api/customers`) từ 60–80%.

---

## 4. Lộ Trình Triển Khai Đề Xuất

| Giai đoạn | Hạng mục | Độ phức tạp | Tác động |
|:---|:---|:---:|:---:|
| **P1** | Dynamic Import cho `InteractiveStudio3D` + Stale Time TanStack Query | Thấp | Rất cao (LCP & First Load) |
| **P2** | Edge Cache tại `worker/index.ts` cho các API Catalog công khai | Thấp | Rất cao (API Latency) |
| **P3** | Database Indexing + Response Compression trên Backend | Trung bình | Cao (Giảm tải server) |
| **P4** | Draco Compression cho Model 3D (`.glb`) | Trung bình | Cao (Băng thông mạng) |
