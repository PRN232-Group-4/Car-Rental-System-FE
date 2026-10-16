import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubscriptionPlans from "@/features/subscriptions/components/SubscriptionPlans";
import { ShieldCheck, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Gói thuê bao xe | Thong Dong - Trả trước theo giờ",
  description:
    "Mua gói thuê bao tiết kiệm đến 35%. Thuê xe theo giờ nhanh chóng không cần thanh toán từng lượt, quản lý số dư giờ linh hoạt trên ứng dụng.",
};

export default function GoiThueBaoPage() {
  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-7xl mx-auto text-center">

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-ink max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Thuê xe theo giờ trả trước. <br />
            <span className="text-primary">
              Chủ động mọi hành trình.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ink-3 max-w-2xl mx-auto leading-relaxed mb-8">
            Giải pháp hoàn hảo cho cá nhân và gia đình thường xuyên di chuyển nội đô hoặc đi công tác.
            Không cần thủ tục thanh toán lặp lại, trừ số giờ chính xác theo từng lượt lăn bánh.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#goi-thue-bao"
              className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all"
            >
              Xem các gói cước
            </a>
            <Link
              href="/my-subscriptions"
              className="px-6 py-3.5 rounded-2xl bg-sunken hover:bg-sunken text-ink font-bold text-sm transition-all"
            >
              Gói thuê của tôi
            </Link>
          </div>

          {/* Giá trị cốt lõi của gói: bố cục 2/1 có trọng tâm (A5: cấm 3 thẻ bằng nhau lười biếng) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto mt-16 text-left items-stretch">
            <div className="md:col-span-6 p-7 sm:p-8 rounded-3xl bg-surface border-2 border-primary/40 shadow-e1 flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-primary-tint text-primary flex items-center justify-center font-bold mb-4">
                  <Zap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-lg text-ink mb-2">Đặt xe tức thì không cần cọc từng lượt</h3>
                <p className="text-sm text-ink-2 leading-relaxed">
                  Gói còn hiệu lực trong tài khoản sẽ trừ thẳng giờ di chuyển. Không tạo hoá đơn trung gian, không giam tiền cọc qua cổng, không chờ đối soát sau mỗi chuyến đi.
                </p>
              </div>
              <div className="pt-5 mt-5 border-t border-line text-xs font-mono text-primary font-bold">
                Quy tắc BE-22: rentals.is_subscription = true, miễn hoá đơn
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-surface border border-line shadow-xs flex-1 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary-tint text-primary flex items-center justify-center font-bold shrink-0">
                    <RefreshCw className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink mb-1">Trừ giờ linh hoạt theo thực tế</h3>
                    <p className="text-xs text-ink-3 leading-relaxed">
                      Tính chính xác theo thời gian thực tế sử dụng. Dễ dàng gia hạn hoặc mua thêm gói mới để cộng dồn hạn mức giờ trực tiếp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-surface border border-line shadow-xs flex-1 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary-tint text-primary flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink mb-1">Ưu tiên giữ xe tại mọi trạm</h3>
                    <p className="text-xs text-ink-3 leading-relaxed">
                      Thành viên sở hữu gói thuê bao được hệ thống ưu tiên giữ xe trong các khung giờ cao điểm và ngày cuối tuần tại toàn bộ chi nhánh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Table Component */}
        <SubscriptionPlans />

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Câu hỏi thường gặp về Gói thuê bao
            </h2>
            <p className="text-sm text-ink-3 mt-2">Mọi điều bạn cần biết trước khi sở hữu gói di chuyển</p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-surface border border-line">
              <h4 className="font-bold text-ink text-base mb-2">
                1. Gói thuê bao áp dụng cho những dòng xe nào?
              </h4>
              <p className="text-sm text-ink-3 leading-relaxed">
                Gói áp dụng cho tất cả các dòng xe ô tô và xe máy trong danh mục của Thong Dong (ngoại trừ các yêu cầu thuê tài xế riêng hoặc thuê dài hạn theo quý).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-line">
              <h4 className="font-bold text-ink text-base mb-2">
                2. Điều gì xảy ra khi tôi dùng hết số giờ trước hạn?
              </h4>
              <p className="text-sm text-ink-3 leading-relaxed">
                Bạn có thể tiếp tục mua gói mới bất kỳ lúc nào để cộng dồn thêm giờ di chuyển vào tài khoản cá nhân.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-line">
              <h4 className="font-bold text-ink text-base mb-2">
                3. Tôi có cần đặt cọc từng lần thuê xe khi dùng gói không?
              </h4>
              <p className="text-sm text-ink-3 leading-relaxed">
                Khi sử dụng gói thuê bao hợp lệ, hệ thống hoàn toàn miễn phí cọc từng lượt cho quý khách.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
