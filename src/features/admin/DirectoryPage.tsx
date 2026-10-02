import {
  Building2,
  KeyRound,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DirectoryEntry = {
  name: string;
  description: string;
  status: "Đang hoạt động" | "Tạm ngưng";
  detail: string;
};

const directories: Record<string, { title: string; description: string; icon: LucideIcon; columns: [string, string, string]; entries: DirectoryEntry[] }> = {
  departments: {
    title: "Departments",
    description: "Danh sách phòng ban và chức năng trong tổ chức.",
    icon: Building2,
    columns: ["Phòng ban", "Chức năng", "Nhân sự"],
    entries: [
      { name: "Vận hành", description: "Quản lý hoạt động thuê và đội xe", status: "Đang hoạt động", detail: "18 nhân viên" },
      { name: "Kinh doanh", description: "Phát triển khách hàng và đối tác", status: "Đang hoạt động", detail: "12 nhân viên" },
      { name: "Chăm sóc khách hàng", description: "Hỗ trợ khách thuê và xử lý yêu cầu", status: "Đang hoạt động", detail: "9 nhân viên" },
      { name: "Tài chính - Kế toán", description: "Hóa đơn, giao dịch và đối soát", status: "Đang hoạt động", detail: "6 nhân viên" },
    ],
  },
  facilities: {
    title: "Facilities",
    description: "Danh sách chi nhánh, thông tin liên hệ và sức chứa đội xe.",
    icon: Building2,
    columns: ["Chi nhánh", "Địa chỉ", "Đội xe"],
    entries: [
      { name: "Quận 1 — Trung tâm", description: "12 Trần Hưng Đạo, TP. Hồ Chí Minh", status: "Đang hoạt động", detail: "18 phương tiện" },
      { name: "Sân bay Tân Sơn Nhất", description: "Ga Quốc nội T1/T2, TP. Hồ Chí Minh", status: "Đang hoạt động", detail: "24 phương tiện" },
      { name: "Tân Bình — Hoàng Hoa Thám", description: "45 Hoàng Hoa Thám, TP. Hồ Chí Minh", status: "Đang hoạt động", detail: "14 phương tiện" },
      { name: "Hà Nội — Long Biên", description: "88 Nguyễn Văn Cừ, Hà Nội", status: "Tạm ngưng", detail: "16 phương tiện" },
    ],
  },
  staffs: {
    title: "Staffs",
    description: "Thông tin nhân viên và phân công chi nhánh.",
    icon: UsersRound,
    columns: ["Nhân viên", "Chức vụ / Phòng ban", "Chi nhánh"],
    entries: [
      { name: "Nguyễn Minh Anh", description: "Quản lý chi nhánh · Vận hành", status: "Đang hoạt động", detail: "Quận 1" },
      { name: "Trần Quốc Bảo", description: "Điều phối viên · Vận hành", status: "Đang hoạt động", detail: "Tân Bình" },
      { name: "Lê Thu Hà", description: "Chuyên viên CSKH", status: "Đang hoạt động", detail: "Quận 1" },
      { name: "Phạm Hoàng Long", description: "Kỹ thuật viên · Bảo dưỡng", status: "Tạm ngưng", detail: "Tân Bình" },
    ],
  },
  roles: {
    title: "Role",
    description: "Các vai trò và quyền truy cập được sử dụng trong hệ thống.",
    icon: KeyRound,
    columns: ["Vai trò", "Phạm vi quyền", "Tài khoản"],
    entries: [
      { name: "Administrator", description: "Toàn quyền cấu hình hệ thống", status: "Đang hoạt động", detail: "2 tài khoản" },
      { name: "Branch Manager", description: "Quản lý dữ liệu trong chi nhánh", status: "Đang hoạt động", detail: "4 tài khoản" },
      { name: "Staff", description: "Xử lý đơn thuê và thông tin khách hàng", status: "Đang hoạt động", detail: "32 tài khoản" },
      { name: "Driver", description: "Nhận phân công và thực hiện kiểm định", status: "Đang hoạt động", detail: "15 tài khoản" },
    ],
  },
};

export default function DirectoryPage({ directory }: { directory: keyof typeof directories }) {
  const data = directories[directory];
  const Icon = data.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><Icon className="h-6 w-6" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Quản trị hệ thống</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{data.title}</h2>
        </div>
      </div>
      <p className="text-sm text-slate-500">{data.description}</p>
      <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        Dữ liệu đang hiển thị là minh họa. Kết nối API quản trị để xem và cập nhật dữ liệu thực tế.
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-slate-900">Danh sách {data.title.toLocaleLowerCase()}</h3>
            <p className="mt-1 text-xs text-slate-400">{data.entries.length} mục minh họa</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                {data.columns.map((column) => <th key={column} className="px-5 py-3">{column}</th>)}
                <th className="px-5 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.entries.map((entry) => (
                <tr key={entry.name} className="text-sm">
                  <td className="px-5 py-4 font-semibold text-slate-800">{entry.name}</td>
                  <td className="px-5 py-4 text-slate-600">{entry.description}</td>
                  <td className="px-5 py-4 text-slate-600">{entry.detail}</td>
                  <td className="px-5 py-4">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${entry.status === "Đang hoạt động" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
