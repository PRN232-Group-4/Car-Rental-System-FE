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
import { ChartCard, CHART_PALETTE } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RevenuePoint } from "../types";

interface RevenueChartProps {
  data?: RevenuePoint[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function formatVndAxis(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} tr`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} k`;
  return String(val);
}

export function RevenueChart({ data = [], isLoading, isError, onRetry }: RevenueChartProps) {
  const mounted = useMounted();

  const totalRevenue = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const totalRevenueFormatted = `${totalRevenue.toLocaleString("vi-VN")} đ`;

  // Chuẩn bị dữ liệu bảng thay thế (a11y)
  const tableData = {
    headers: ["Ngày (GMT+7)", "Ô tô xăng (VND)", "Ô tô điện (VND)", "Xe máy (VND)", "Tổng doanh thu (VND)"],
    rows: data.map((d) => [
      d.bucket,
      (d.byGroup?.["Ô tô xăng"] ?? 0).toLocaleString("vi-VN"),
      (d.byGroup?.["Ô tô điện"] ?? 0).toLocaleString("vi-VN"),
      (d.byGroup?.["Xe máy"] ?? 0).toLocaleString("vi-VN"),
      (d.total ?? 0).toLocaleString("vi-VN"),
    ]),
  };

  if (isError) {
    return (
      <ChartCard title="Doanh thu theo thời gian" description="Tổng doanh thu đã thu phân bổ theo ngày">
        <ErrorState message="Không thể tải biểu đồ doanh thu." onRetry={onRetry} />
      </ChartCard>
    );
  }

  if (isLoading || !mounted) {
    return (
      <ChartCard title="Doanh thu theo thời gian" description="Tổng doanh thu đã thu phân bổ theo ngày">
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-xl bg-sunken text-xs text-ink-3">
          Đang tải dữ liệu biểu đồ doanh thu...
        </div>
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard title="Doanh thu theo thời gian" description="Tổng doanh thu đã thu phân bổ theo ngày">
        <EmptyState title="Chưa có dữ liệu doanh thu" description="Không phát sinh thanh toán trong khoảng thời gian này." />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Doanh thu theo thời gian"
      description={`Tổng doanh thu kỳ này: ${totalRevenueFormatted} (Đã thu, chưa trừ hoàn cọc)`}
      tableData={tableData}
      className="col-span-1 lg:col-span-2"
    >
      <div
        role="img"
        aria-label={`Biểu đồ cột doanh thu theo thời gian, tổng cộng ${totalRevenueFormatted}`}
        className="h-72 w-full pt-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="bucket"
              tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
            />
            <YAxis
              tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
              tickFormatter={formatVndAxis}
            />
            <Tooltip
              formatter={(value: unknown, name: unknown) => [
                `${Number(value || 0).toLocaleString("vi-VN")} đ`,
                String(name) === "byGroup.Ô tô xăng"
                  ? "Ô tô xăng"
                  : String(name) === "byGroup.Ô tô điện"
                    ? "Ô tô điện"
                    : String(name) === "byGroup.Xe máy"
                      ? "Xe máy"
                      : String(name),
              ]}
              contentStyle={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--line)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "var(--shadow-e2)",
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
            />
            <Bar
              dataKey="byGroup.Ô tô xăng"
              name="Ô tô xăng"
              stackId="a"
              fill={CHART_PALETTE[0]}
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="byGroup.Ô tô điện"
              name="Ô tô điện"
              stackId="a"
              fill={CHART_PALETTE[1]}
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="byGroup.Xe máy"
              name="Xe máy"
              stackId="a"
              fill={CHART_PALETTE[2]}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
