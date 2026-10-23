"use client";

import { FileCheck2, Camera, Gauge, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  { title: "Ghi nhận tình trạng xe", description: "Kỹ thuật viên kiểm tra xe trước khi bàn giao và sau khi khách trả xe.", icon: FileCheck2 },
  { title: "Lưu ảnh và ghi chú", description: "Ảnh và ghi chú trong biên bản giúp đối chiếu tình trạng xe khi nhận và trả.", icon: Camera },
  { title: "Đối chiếu số km và nhiên liệu", description: "Chỉ số thực tế được ghi nhận trong biên bản kiểm tra của từng đơn thuê.", icon: Gauge },
];

export default function InspectionSection() {
  return <section id="kiem-dinh" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
    <h2 className="text-3xl sm:text-5xl font-black text-ink">Kiểm tra xe trước và sau chuyến đi</h2>
    <p className="mt-5 max-w-2xl text-sm text-ink-2">Xem kết quả kiểm tra trong chi tiết đơn thuê. Kết quả, nhân sự phụ trách và ảnh được cập nhật theo từng biên bản.</p>
    <div className="mt-10 grid gap-8 md:grid-cols-3">
      {steps.map(({ title, description, icon: Icon }) => <div key={title} className="border-t border-line pt-6">
        <Icon className="h-6 w-6 text-primary" />
        <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
        <p className="mt-3 text-sm text-ink-2">{description}</p>
      </div>)}
    </div>
    <Button as="a" href="/my-rentals" variant="secondary" className="mt-10">Xem đơn thuê của bạn<ArrowRight className="ml-2 h-4 w-4" /></Button>
  </section>;
}
