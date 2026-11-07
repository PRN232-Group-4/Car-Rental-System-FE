import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";

/**
 * Khung xương cấp cổng (portal) cho lúc chờ phiên đăng nhập/quyền truy cập.
 *
 * Mục đích: khi `AuthGate` (hoặc cổng tài xế) đang xác thực, người dùng vẫn thấy đúng
 * hình dạng của khu vực mình sắp vào — cùng bố cục masthead/dải chương/mảng nội dung,
 * cùng token `td-*` — nên khi dữ liệu về không bị giật layout và không có màn hình trắng.
 *
 * Cấu trúc bám theo `TransitDeskShell` (Admin/Staff) và `CustomerDeskShell` (khách hàng).
 */

function MastheadSkeleton({ chapters = 5, chapterWidth = "w-24" }: { chapters?: number; chapterWidth?: string }) {
  return <>
    {/* Masthead: vùng thương hiệu + dải chương + khu tiện ích */}
    <div className="sticky top-0 z-30 border-b border-td-rule bg-td-paper">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-4 py-3 lg:grid-cols-[280px_minmax(0,1fr)_auto] lg:px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {Array.from({ length: chapters }, (_, index) => <Skeleton key={index} className={`h-8 ${chapterWidth}`} />)}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="hidden h-8 w-28 sm:block" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      {/* Dải chương ngữ cảnh */}
      <div className="flex items-center gap-3 border-t border-td-rule/70 px-4 py-2.5 lg:px-6">
        <Skeleton className="h-3 w-24" />
        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-3 w-20" />)}
        </div>
      </div>
    </div>
  </>;
}

function FolioSkeleton() {
  return <div className="space-y-3 border-b border-td-ink pb-5">
    <Skeleton className="h-3 w-40" />
    <Skeleton className="h-8 w-72 max-w-full" />
    <Skeleton className="h-4 w-full max-w-2xl" />
  </div>;
}

/** Loading của khu vận hành/quản trị: masthead + dải chương + folio + bảng dữ liệu. */
export function AdminShellSkeleton({ label = "Đang tải không gian vận hành..." }: { label?: string }) {
  return <div data-portal="admin" aria-busy="true" className="flex min-h-dvh flex-col bg-td-paper text-td-ink">
    <MastheadSkeleton chapters={6} />
    <SkeletonBlock label={label} className="mx-auto w-full max-w-[1860px] flex-1 px-4 py-8 sm:px-6 lg:px-12">
      <FolioSkeleton />
      {/* Bảng danh sách: giữ cấu trúc cột để không nhảy bố cục */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border border-td-rule bg-td-white p-4">
          <div className="flex items-center gap-4 border-b border-td-ink pb-3">
            {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-3 flex-1" />)}
          </div>
          {Array.from({ length: 6 }, (_, row) => <div key={row} className="flex items-center gap-4 border-b border-td-rule/60 py-3 last:border-b-0">
            {Array.from({ length: 5 }, (_, column) => <Skeleton key={column} className={column === 0 ? "h-4 w-40 max-w-full" : "h-4 flex-1"} />)}
          </div>)}
        </div>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-9 w-48" />
        </div>
      </div>
    </SkeletonBlock>
  </div>;
}

/** Loading của khu khách hàng: masthead + dải chương + folio + lưới card/khối nội dung. */
export function CustomerShellSkeleton({ label = "Đang tải khu khách hàng..." }: { label?: string }) {
  return <div data-portal="customer" aria-busy="true" className="flex min-h-dvh flex-col bg-td-paper text-td-ink">
    <MastheadSkeleton chapters={5} chapterWidth="w-28" />
    <SkeletonBlock label={label} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <FolioSkeleton />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-3 border border-td-rule bg-td-white p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-32" />
        </div>)}
      </div>
      <div className="mt-6 space-y-3 border border-td-rule bg-td-white p-5">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center justify-between gap-4 border-t border-td-rule/60 pt-3">
          <Skeleton className="h-4 w-40 max-w-full" />
          <Skeleton className="h-4 w-24" />
        </div>)}
      </div>
    </SkeletonBlock>
  </div>;
}

/** Loading của cổng tài xế: cùng masthead nhưng nội dung là ca trực/xe được phân công. */
export function DriverShellSkeleton({ label = "Đang tải cổng tài xế..." }: { label?: string }) {
  return <div data-portal="driver" aria-busy="true" className="flex min-h-dvh flex-col bg-td-paper text-td-ink">
    <MastheadSkeleton chapters={5} chapterWidth="w-24" />
    <SkeletonBlock label={label} className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <FolioSkeleton />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-3 border border-td-rule bg-td-white p-5">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>)}
      </div>
    </SkeletonBlock>
  </div>;
}
