"use client";
export default function ResultPagination({ page, pageSize, totalCount, busy, onPage }: { page: number; pageSize: number; totalCount: number; busy?: boolean; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(totalCount / pageSize));
  return <nav aria-label="Phân trang kết quả" className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-ink-3">
    <span aria-live="polite">{totalCount.toLocaleString("vi-VN")} kết quả · Trang {page}/{pages}</span>
    <div className="flex gap-2"><button type="button" disabled={busy || page <= 1} onClick={() => onPage(page - 1)} className="min-h-11 border border-line-strong bg-surface px-4 disabled:opacity-50">Trang trước</button><button type="button" disabled={busy || page >= pages} onClick={() => onPage(page + 1)} className="min-h-11 border border-line-strong bg-surface px-4 disabled:opacity-50">Trang sau</button></div>
  </nav>;
}
