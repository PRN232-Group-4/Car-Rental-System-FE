import React from "react";
import InvoiceDetailClient from "./InvoiceDetailClient";

export function generateStaticParams() {
  // ponytail: static export chỉ sinh được các route biết trước, nên prerender sẵn một dải id hợp lý
  // (id hóa đơn là identity tăng dần trong DB). Ceiling: id > 200 sẽ rơi vào SPA fallback (ra trang chủ).
  // Nếu cần đúng cho mọi id: đổi sang route tĩnh /invoices/detail?id=... (query param) rồi sửa 3 link.
  return Array.from({ length: 200 }, (_, index) => ({ id: String(index + 1) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <InvoiceDetailClient id={id} />;
}
