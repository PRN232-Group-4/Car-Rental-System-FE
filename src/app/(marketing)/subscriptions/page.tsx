import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubscriptionPlans from "@/features/subscriptions/components/SubscriptionPlans";

export const metadata = {
  title: "Gói thuê bao xe | Thong Dong - Trả trước theo giờ",
  description:
    "Xem các gói thuê bao đang mở bán, giá, số giờ và thời hạn; theo dõi số dư giờ trong tài khoản.",
};

export default function GoiThueBaoPage() {
  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <Navbar />

      <main className="flex-1 pt-[53px]">
        <h1 className="sr-only">Gói thuê bao xe ô tô</h1>

        {/* Pricing Table Component */}
        <SubscriptionPlans />

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Câu hỏi thường gặp về gói thuê bao
            </h2>
            <p className="text-sm text-ink-3 mt-2">Mọi điều bạn cần biết trước khi sở hữu gói di chuyển</p>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-surface border border-line">
              <h4 className="font-bold text-ink text-base mb-2">
                1. Gói thuê bao áp dụng cho những dòng xe nào?
              </h4>
              <p className="text-sm text-ink-3 leading-relaxed">
                Gói áp dụng cho tất cả các dòng xe ô tô trong danh mục của Thong Dong (ngoại trừ các yêu cầu thuê tài xế riêng hoặc thuê dài hạn theo quý).
              </p>
            </div>

            <div className="p-6 bg-surface border border-line">
              <h4 className="font-bold text-ink text-base mb-2">
                2. Điều gì xảy ra khi tôi dùng hết số giờ trước hạn?
              </h4>
              <p className="text-sm text-ink-3 leading-relaxed">
                Bạn có thể tiếp tục mua gói mới bất kỳ lúc nào để cộng dồn thêm giờ di chuyển vào tài khoản cá nhân.
              </p>
            </div>

            <div className="p-6 bg-surface border border-line">
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
