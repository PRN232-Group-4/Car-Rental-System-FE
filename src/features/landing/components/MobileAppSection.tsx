"use client";

import { Smartphone } from "lucide-react";
import { Stage } from "@/components/ui/Stage";
import { Button } from "@/components/ui/Button";

export default function MobileAppSection() {
  return <Stage variant="ink" className="py-20 md:py-28 px-4 sm:px-6">
    <div className="max-w-7xl mx-auto space-y-6 text-white">
      <Smartphone className="h-8 w-8 text-primary-tint" />
      <h2 className="text-3xl sm:text-5xl font-black">Quản lý chuyến đi trên điện thoại</h2>
      <p className="max-w-2xl text-sm text-white/80">Truy cập tài khoản trên trình duyệt để xem đơn thuê, hóa đơn và các gói thuê bao của bạn.</p>
      <Button as="a" href="/my-rentals" variant="secondary-stage">Xem đơn thuê</Button>
    </div>
  </Stage>;
}
