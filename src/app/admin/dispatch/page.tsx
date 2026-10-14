import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import DispatchManager from "@/features/operations/DispatchManager";
export default function DispatchPage() {
  return <Suspense fallback={<PageFallback label="Đang tải màn hình điều phối..." />}><DispatchManager /></Suspense>;
}
