import { Suspense } from "react";
import IncidentReporter from "@/features/operations/IncidentReporter";
export default function ReportIncidentPage() {
  return <Suspense fallback={<p>Đang tải biểu mẫu báo cáo...</p>}><IncidentReporter /></Suspense>;
}
