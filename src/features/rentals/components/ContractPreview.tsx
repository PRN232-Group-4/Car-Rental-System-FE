"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

type Preview = { url: string; type: string } | null;

/**
 * Xem trước hợp đồng đã ký ngay trên trang. Tải file bằng cookie phiên rồi hiển thị qua object URL,
 * vì endpoint tài liệu trả về dạng tệp đính kèm (trình duyệt sẽ tải xuống nếu mở trực tiếp).
 */
export default function ContractPreview({ href, title }: { href: string; title: string }) {
  const [preview, setPreview] = useState<Preview>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | null = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- đặt lại khi đổi tài liệu hoặc thử lại.
    setPreview(null);
    setError("");
    fetch(href, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? "Chưa có file hợp đồng đã ký." : "Không tải được hợp đồng. Vui lòng thử lại.");
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setPreview({ url: objectUrl, type: blob.type });
      })
      .catch((failure: unknown) => {
        if (controller.signal.aborted) return;
        setError(failure instanceof TypeError ? "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại." : failure instanceof Error ? failure.message : "Không tải được hợp đồng.");
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [href, attempt]);

  if (error) return <p role="alert" className="text-sm text-danger">{error} <button type="button" className="underline" onClick={() => setAttempt((value) => value + 1)}>Thử lại</button></p>;
  if (!preview) return <div role="status" aria-label="Đang tải bản xem trước hợp đồng"><Skeleton className="h-96 w-full" /></div>;
  return <div className="space-y-2">
    {preview.type.startsWith("image/")
      // eslint-disable-next-line @next/next/no-img-element -- object URL cục bộ, không qua tối ưu ảnh của Next.
      ? <img src={preview.url} alt={title} className="max-h-[70vh] w-full border border-td-rule bg-td-white object-contain" />
      : <iframe src={preview.url} title={title} className="h-[70vh] w-full border border-td-rule bg-td-white" />}
    <a href={preview.url} download className="inline-block text-sm font-semibold text-primary underline">Tải file hợp đồng</a>
  </div>;
}
