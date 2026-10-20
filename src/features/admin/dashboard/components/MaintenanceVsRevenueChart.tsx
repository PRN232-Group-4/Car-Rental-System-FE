import { useMounted } from "@/hooks/use-mounted";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { AlertTriangle } from "lucide-react";
import { ChartCard, CHART_PALETTE } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MaintenanceVsRevenueRow } from "../types";

interface MaintenanceVsRevenueChartProps {
  data?: MaintenanceVsRevenueRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function formatVndAxis(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} tr`;
  return String(val);
}

export function MaintenanceVsRevenueChart({
  data = [],
  isLoading,
  isError,
  onRetry,
}: MaintenanceVsRevenueChartProps) {
  const mounted = useMounted();

  const highCostVehicles = data.filter((v) => v.isHighCost || v.maintenanceCost > v.revenue);

  const tableData = {
    headers: ["Phương tiện", "Chi phí bảo dưỡng (VND)", "Doanh thu mang lại (VND)", "Đánh giá hiệu quả"],
    rows: data.map((d) => [
      d.name,
      d.maintenanceCost.toLocaleString("vi-VN"),
      d.revenue.toLocaleString("vi-VN"),
      d.isHighCost || d.maintenanceCost > d.revenue
        ? "CẢNH BÁO: Chi phí bảo dưỡng vượt doanh thu"
        : "Hiệu quả tốt",
    ]),
  };

  if (isError) {
    return (
      <ChartCard title="Chi phí bảo dưỡng vs Doanh thu" description="So sánh phí sửa chữa và doanh thu theo phương tiện">
        <ErrorState message="Không thể tải dữ liệu bảo dưỡng vs doanh thu." onRetry={onRetry} />
      </ChartCard>
    );
  }

  if (isLoading || !mounted) {
    return (
      <ChartCard title="Chi phí bảo dưỡng vs Doanh thu" description="So sánh phí sửa chữa và doanh thu theo phương tiện">
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded bg-td-chalk text-xs text-td-muted">
          Đang tải dữ liệu so sánh chi phí...
        </div>
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard title="Chi phí bảo dưỡng vs Doanh thu" description="So sánh phí sửa chữa và doanh thu theo phương tiện">
        <EmptyState title="Chưa có dữ liệu" description="Không phát sinh chi phí bảo dưỡng trong kỳ này." />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Chi phí bảo dưỡng vs Doanh thu"
      description="Đối chiếu chi phí sửa chữa bảo trì với dòng tiền xe mang lại (FR-DASH-03)"
      tableData={tableData}
      className="col-span-1 lg:col-span-2"
    >
      <div className="flex flex-col gap-4">
        {/* Banner cảnh báo xe có chi phí bảo dưỡng vượt doanh thu */}
        {highCostVehicles.length > 0 && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded border border-danger/30 bg-danger-bg p-3 text-xs text-danger"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
            <div>
              <span className="font-semibold">Phát hiện {highCostVehicles.length} phương tiện có chi phí bảo dưỡng vượt doanh thu:</span>{" "}
              {highCostVehicles.map((v) => v.name).join(", ")}. Cần xem xét kế hoạch thanh lý hoặc kiểm tra kỹ thuật sâu.
            </div>
          </div>
        )}

        <div
          role="img"
          aria-label="Biểu đồ cột đôi so sánh chi phí bảo dưỡng và doanh thu của từng xe"
          className="h-72 w-full pt-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--td-ink-muted, var(--ink-3))", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fill: "var(--td-ink-muted, var(--ink-3))", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                tickFormatter={formatVndAxis}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [
                  `${Number(value || 0).toLocaleString("vi-VN")} đ`,
                  String(name),
                ]}
                contentStyle={{
                  backgroundColor: "var(--surface)",
                  borderColor: "var(--line)",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-e2)",
                  color: "var(--ink)",
                }}
                itemStyle={{
                  color: "var(--ink)",
                }}
                labelStyle={{
                  color: "var(--ink-2)",
                  fontWeight: 600,
                }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 10, color: "var(--ink-2)" }} />
              <Bar
                dataKey="revenue"
                name="Doanh thu"
                fill={CHART_PALETTE[1]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="maintenanceCost"
                name="Chi phí bảo dưỡng"
                fill={CHART_PALETTE[3]}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}
