"use client";

import HalftoneImage from "../HalftoneImage";

const TRUST_FACTS = [
  {
    tag: "01 · PHÁP NHÂN MINH BẠCH",
    headline: "DOANH NGHIỆP VẬN TẢI HỢP PHÁP",
    // TODO-DATA src/features/landing/components/chapters/TrustChapter.tsx:10: Giấy phép KD số 0317892345/GP-SGT được cấp bởi Sở GTVT TP.HCM
    detail: "CÔNG TY CỔ PHẦN DỊCH VỤ VẬN TẢI THÔNG DONG",
    meta: "Mã số thuế: 0317892345 · Trụ sở: 120 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh",
  },
  {
    tag: "02 · BẢO HIỂM HAI CHIỀU",
    headline: "100% ĐỘI XE ĐƯỢC BẢO HIỂM TOÀN DIỆN",
    // TODO-DATA src/features/landing/components/chapters/TrustChapter.tsx:17: Hợp đồng đối tác Bảo hiểm PVI gói vật chất & thủy kích
    detail: "Hạn mức bồi thường vật chất thân vỏ và trách nhiệm dân sự tối đa theo quy chuẩn quốc tế.",
    meta: "Đối tác bảo lãnh: PVI Insurance · Hotline hỗ trợ hiện trường 24/7",
  },
  {
    tag: "03 · QUYỀN LỢI TÀI CHÍNH",
    headline: "HOÀN TRẢ TIỀN CỌC MINH BẠCH 15 PHÚT",
    // TODO-DATA src/features/landing/components/chapters/TrustChapter.tsx:24: Hoàn tiền tự động qua PayOS trong vòng 15 phút sau biên bản kiểm định
    detail: "Hệ thống đối soát tự động qua PayOS và liên minh ngân hàng NAPAS.",
    meta: "Không tạm giữ dòng tiền của khách hàng quá 24 giờ trong mọi trường hợp.",
  },
];

export default function TrustChapter() {
  return (
    <section
      id="tin-cay"
      className="relative w-full min-h-[100dvh] bg-ink-950 text-bone-100 py-24 sm:py-32 px-6 sm:px-12 border-t border-bone-100/10 select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-bone-100/15 pb-8 mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-sun-400 block mb-3">
            04 / CHƯƠNG IV · CAM KẾT
          </span>
          <h2 className="font-display uppercase tracking-tight text-4xl sm:text-6xl font-black text-bone-100 leading-tight">
            Tin cậy bằng dữ kiện.
          </h2>
          <p className="font-sans text-sm sm:text-base text-bone-100/70 max-w-2xl mt-4 leading-relaxed">
            Không quảng cáo hoa mỹ. Mọi cam kết vận hành đều được bảo đảm bằng pháp nhân, hợp đồng bảo hiểm chính quy và công nghệ kiểm định số.
          </p>
        </div>

        {/* Fact Rows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-7 divide-y divide-bone-100/15">
            {TRUST_FACTS.map((fact) => (
              <div key={fact.tag} className="py-8 first:pt-0 space-y-3">
                <span className="font-mono text-xs text-sun-400 tracking-wider block">
                  {fact.tag}
                </span>
                <h3 className="font-display uppercase tracking-tight text-xl sm:text-2xl font-bold text-bone-100">
                  {fact.headline}
                </h3>
                <p className="font-sans text-sm text-bone-100/90 font-medium">
                  {fact.detail}
                </p>
                <p className="font-sans text-xs text-bone-100/50">
                  {fact.meta}
                </p>
              </div>
            ))}
          </div>

          {/* Real Car Photo in Riso Halftone Duotone */}
          <div className="lg:col-span-5 space-y-4">
            <HalftoneImage
              src="/assets/fleet/porsche-911-4s.png"
              alt="Porsche 911 Carrera 4S trong đội xe thực tế"
              width={640}
              height={400}
              className="w-full aspect-[4/3]"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-bone-100/50 pt-2 border-t border-bone-100/15">
              <span>ĐỘI XE THỰC TẾ · TP. HỒ CHÍ MINH</span>
              <span className="text-sun-400">100% XE SỞ HỮU TRỰC TIẾP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
