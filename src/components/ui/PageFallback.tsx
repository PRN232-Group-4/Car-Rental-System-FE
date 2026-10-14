/**
 * Fallback chờ cho route dùng `Suspense`.
 * Một nguồn duy nhất để mọi route tải giống nhau (A6: chữ Sunken/Ink-3, không spinner tròn
 * cho tải trang — spinner chỉ dành cho nút đang gửi).
 */
export default function PageFallback({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <p role="status" className="px-4 py-16 text-center text-sm font-medium text-ink-3 sm:px-6">
      {label}
    </p>
  );
}
