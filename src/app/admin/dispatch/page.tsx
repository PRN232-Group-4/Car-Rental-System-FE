import { Suspense } from "react";
import DispatchManager from "@/features/operations/DispatchManager";
export default function DispatchPage() {
  return <Suspense fallback={<p>Đang tải màn hình điều phối...</p>}><DispatchManager /></Suspense>;
}
