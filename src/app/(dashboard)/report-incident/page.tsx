import { Suspense } from "react";
import PageFallback from "@/components/ui/PageFallback";
import IncidentReporter from "@/features/operations/IncidentReporter";
export default function ReportIncidentPage() {
  return <Suspense fallback={<PageFallback label="Đang tải biểu mẫu báo cáo sự cố..." />}><IncidentReporter /></Suspense>;
}
