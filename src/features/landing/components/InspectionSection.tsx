"use client";

import { useState } from "react";
import { FileCheck2, Camera, Gauge, Fuel, ClipboardCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Khối kiểm tra xe trên landing: bố cục 12 cột của bản dev-huy — bên trái là danh sách
 * điểm kiểm tra chọn được, bên phải là panel chi tiết của điểm đang chọn và phần đối chiếu
 * khi quyết toán.
 *
 * Nội dung chỉ mô tả những gì hệ thống thực sự ghi trong biên bản kiểm tra
 * (ảnh + ghi chú hư hỏng, chỉ số km, mức xăng/pin, kết quả đạt/không đạt và người xác nhận)
 * và cách phụ phí/hoàn cọc được xử lý theo `rental_policies` — không nêu mốc thời gian,
 * cảm biến hay cam kết nào chưa được backend bảo đảm.
 */
interface InspectionPoint {
  id: string;
  name: string;
  code: string;
  tag: string;
  desc: string;
  specs: string[];
  icon: typeof FileCheck2;
}

const INSPECTION_POINTS: InspectionPoint[] = [
  {
    id: "exterior",
    name: "Ngoại thất và ảnh xe",
    code: "EXTERIOR",
    tag: "ẢNH TRONG BIÊN BẢN",
    desc: "Kỹ thuật viên tải ảnh và ghi chú hư hỏng khi giao xe và khi nhận lại xe.",
    specs: ["Ảnh do KTV tải lên", "Ghi chú hư hỏng", "Xem trong đơn thuê"],
    icon: Camera,
  },
  {
    id: "odometer",
    name: "Chỉ số km",
    code: "ODOMETER",
    tag: "GHI KHI GIAO VÀ NHẬN",
    desc: "Chỉ số km thực tế được ghi vào biên bản trước và sau chuyến đi để đối chiếu.",
    specs: ["Ghi lúc giao xe", "Ghi lúc nhận lại", "Đối chiếu khi quyết toán"],
    icon: Gauge,
  },
  {
    id: "fuel",
    name: "Xăng hoặc pin",
    code: "FUEL-PIN",
    tag: "MỨC NĂNG LƯỢNG",
    desc: "Mức xăng hoặc mức pin tại thời điểm giao và nhận xe, dùng làm căn cứ khi trả xe.",
    specs: ["Mức xăng", "Mức pin", "Ghi trong biên bản"],
    icon: Fuel,
  },
  {
    id: "signoff",
    name: "Kết quả và người xác nhận",
    code: "RESULT",
    tag: "ĐẠT HOẶC KHÔNG ĐẠT",
    desc: "Kết quả kiểm tra, nhân sự phụ trách và thời điểm ghi nhận của từng biên bản.",
    specs: ["Đạt hoặc không đạt", "Nhân sự phụ trách", "Thời điểm ghi nhận"],
    icon: ClipboardCheck,
  },
];

const TRUST_POINTS = [
  "Ảnh và ghi chú do kỹ thuật viên tải lên trong biên bản",
  "Chỉ số km, mức xăng hoặc pin được ghi ở cả hai lần giao và nhận",
  "Kết quả kiểm tra đạt hoặc không đạt do nhân viên xác nhận",
];

export default function InspectionSection() {
  const [activeId, setActiveId] = useState(INSPECTION_POINTS[0].id);
  const activePoint = INSPECTION_POINTS.find((point) => point.id === activeId) ?? INSPECTION_POINTS[0];
  const ActiveIcon = activePoint.icon;

  return (
    <section id="kiem-dinh" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-ink sm:text-5xl">
            Kiểm tra xe trước và sau chuyến đi
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-ink-2 sm:text-base">
          Mỗi lượt thuê có biên bản kiểm tra ở hai đầu: giao xe và nhận lại. Biên bản đó là căn cứ đối chiếu tình trạng xe,
          phụ phí phát sinh và hoàn cọc.
        </p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
        {/* Trái: danh sách điểm kiểm tra chọn được */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {INSPECTION_POINTS.map((point) => {
            const isSelected = point.id === activePoint.id;
            const Icon = point.icon;
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => setActiveId(point.id)}
                aria-pressed={isSelected}
                className={`flex flex-col justify-between rounded-3xl border p-5 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isSelected
                    ? "border-primary/50 bg-surface shadow-[0_8px_24px_-4px_rgba(180,83,9,0.12)] ring-1 ring-primary/20"
                    : "border-line bg-surface-raised hover:border-line-strong hover:bg-surface"
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-tint px-2.5 py-0.5 font-mono text-xs font-black text-primary">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {point.tag}
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 font-mono text-xs font-bold ${
                        isSelected ? "bg-primary-tint text-primary" : "bg-sunken text-ink-2"
                      }`}
                    >
                      {isSelected ? "ĐANG XEM" : "CHI TIẾT"}
                    </span>
                  </div>

                  <h3 className="font-display mb-1.5 text-base font-bold text-ink">{point.name}</h3>
                  <p className="mb-4 text-xs leading-relaxed text-ink-2">{point.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
                  {point.specs.map((spec) => (
                    <span key={spec} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-xs font-medium text-ink-2">
                      {spec}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Phải: panel chi tiết của điểm đang chọn */}
        <div className="flex flex-col justify-between rounded-3xl border border-line-strong bg-surface p-7 text-ink shadow-e2 sm:p-8 lg:col-span-5">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-mono text-xs font-bold tracking-wider text-ink">BIÊN BẢN KIỂM TRA</span>
              </div>
              <span className="rounded-lg border border-primary/40 bg-primary-tint px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                TRONG ĐƠN THUÊ
              </span>
            </div>

            {/* Điểm đang chọn */}
            <div className="mb-5 rounded-2xl border border-line bg-surface-raised p-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <h4 className="font-display flex items-center gap-2 text-lg font-bold text-balance text-ink">
                  <ActiveIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {activePoint.name}
                </h4>
                <span className="shrink-0 rounded-lg border border-primary/20 bg-primary-tint px-2 py-0.5 font-mono text-xs font-bold text-primary">
                  {activePoint.code}
                </span>
              </div>
              <p className="text-pretty text-xs leading-relaxed text-ink-2">{activePoint.desc}</p>
            </div>

            {/* Đối chiếu khi quyết toán */}
            <div className="mb-5 rounded-2xl border border-line bg-surface-raised p-4">
              <div className="mb-2 flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>DÙNG KHI QUYẾT TOÁN</span>
              </div>
              <div className="my-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl border border-line bg-surface p-2">
                  <span className="block font-mono text-xs text-ink-3">CĂN CỨ</span>
                  <strong className="font-mono text-sm text-primary">Biên bản kiểm tra</strong>
                </div>
                <div className="rounded-xl border border-line bg-surface p-2">
                  <span className="block font-mono text-xs text-ink-3">PHỤ PHÍ</span>
                  <strong className="font-mono text-sm text-ink">Trừ vào cọc trước</strong>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-ink-2">
                Phụ phí quá giờ trừ vào tiền đặt cọc trước; phần vượt quá cọc được phát hành thành hóa đơn bổ sung có hạn
                thanh toán. Hoàn cọc do bộ phận vận hành duyệt trên đúng số tiền còn lại.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-ink-2">
              {TRUST_POINTS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-line pt-6">
            <Button
              as="a"
              href="/my-rentals"
              variant="amber-hero"
              className="flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold tracking-wider uppercase sm:text-sm"
            >
              <span>Xem đơn thuê của bạn</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
