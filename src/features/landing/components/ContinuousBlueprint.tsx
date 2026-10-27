"use client";

/**
 * ContinuousBlueprint: Nền lưới tọa độ hairline 1px liên tục toàn trang.
 * Đã loại bỏ 100% chữ trang trí, thước đo CAD giả lập và nhãn tiêu chuẩn viễn tưởng theo DESIGN.md A11.
 * Tương thích hoàn toàn giữa Light Mode và Dark Mode qua currentColor và opacity an toàn.
 */
export default function ContinuousBlueprint() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none text-slate-900/5 dark:text-slate-100/5"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="page-blueprint-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M 40 0 L 40 80 M 0 40 L 80 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2,4"
            />
            <circle cx="40" cy="40" r="1" fill="#b45309" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#page-blueprint-grid)" />
      </svg>
    </div>
  );
}
