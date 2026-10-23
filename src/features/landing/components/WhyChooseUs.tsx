"use client";

import { Stage } from "@/components/ui/Stage";

const benefits = [
  { title: "Đội xe do đơn vị vận hành quản lý", description: "Tra cứu thông tin xe và cơ sở nhận xe trước khi đặt." },
  { title: "Kiểm tra trước và sau thuê", description: "Theo dõi biên bản kiểm tra, ảnh và ghi chú trong chi tiết đơn thuê." },
  { title: "Chi phí theo đơn thuê", description: "Xem hóa đơn, trạng thái thanh toán và quyết toán của từng chuyến đi trong tài khoản." },
];
export default function WhyChooseUs() {
  return <Stage variant="ink" className="py-20 md:py-28 px-4 sm:px-6">
    <div className="max-w-7xl mx-auto text-white">
      <h2 className="text-3xl sm:text-5xl font-black">Thông tin rõ ràng trong từng chuyến đi</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">{benefits.map(item => <div key={item.title} className="border-t border-white/20 pt-6"><h3 className="text-xl font-bold">{item.title}</h3><p className="mt-3 text-sm text-white/80">{item.description}</p></div>)}</div>
    </div>
  </Stage>;
}
