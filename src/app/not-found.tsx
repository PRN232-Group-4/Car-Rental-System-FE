import Link from "@/components/navigation/NavigationLink";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[100dvh] bg-canvas text-ink flex items-center justify-center p-4 sm:p-6 focus:outline-none"
    >
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink">
            Không tìm thấy trang
          </h1>
          <p className="text-sm text-ink-3 leading-relaxed max-w-sm mx-auto">
            Đường dẫn bạn vừa truy cập không tồn tại hoặc đã được chuyển dời trên hệ thống Thong Dong.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
          <Link
            href="/find"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink hover:bg-canvas transition cursor-pointer"
          >
            <Search className="w-4 h-4 text-primary" />
            <span>Tìm thuê xe</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
