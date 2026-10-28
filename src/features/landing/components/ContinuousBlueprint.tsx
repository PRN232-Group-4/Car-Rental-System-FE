"use client";

/**
 * ContinuousBlueprint: Nền lưới tọa độ hairline 1px liên tục toàn trang.
 * Thay thế hoàn toàn các nút SVG trong DOM bằng background-image SVG pattern tĩnh
 * để giảm thiểu tối đa TBT trong quá trình khởi tạo và layout trang.
 * Không dùng gradient CSS, không chứa chữ trang trí, tuân thủ DESIGN.md A11.
 */
export default function ContinuousBlueprint() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Light mode blueprint pattern */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M80 0L0 0 0 80' fill='none' stroke='%230f172a' stroke-opacity='0.05' stroke-width='1'/%3E%3Cpath d='M40 0L40 80M0 40L80 40' fill='none' stroke='%230f172a' stroke-opacity='0.05' stroke-width='0.5' stroke-dasharray='2,4'/%3E%3Ccircle cx='40' cy='40' r='1' fill='%23b45309' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Dark mode blueprint pattern */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M80 0L0 0 0 80' fill='none' stroke='%23f1f5f9' stroke-opacity='0.05' stroke-width='1'/%3E%3Cpath d='M40 0L40 80M0 40L80 40' fill='none' stroke='%23f1f5f9' stroke-opacity='0.05' stroke-width='0.5' stroke-dasharray='2,4'/%3E%3Ccircle cx='40' cy='40' r='1' fill='%23b45309' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
