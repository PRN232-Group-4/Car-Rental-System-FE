import { useMounted } from "@/hooks/use-mounted";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartCard, CHART_PALETTE } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RentalStatusCount } from "../types";

interface RentalsStatusChartProps {
  data?: RentalStatusCount[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function RentalsStatusChart({
  data = [],
  isLoading,
  isError,
  onRetry,
}: RentalsStatusChartProps) {
  const mounted = useMounted();

  const totalRentals = data.reduce((sum, item) => sum + (item.count || 0), 0);

  const tableData = {
    headers: ["Trạng thái đơn", "Số lượng đơn", "Tỉ trọng (%)"],
    rows: data.map((d) => [
      d.label,
      d.count,
      totalRentals > 0 ? `${((d.count / totalRentals) * 100).toFixed(1)}%` : "0%",
    ]),
  };

  if (isError) {
    return (
      <ChartCard title="Đơn thuê theo trạng thái" description="Phân bổ toàn bộ đơn thuê trong kỳ">
        <ErrorState message="Không thể tải phân bổ đơn thuê." onRetry={onRetry} />
      </ChartCard>
    );
  }

  if (isLoading || !mounted) {
    return (
      <ChartCard title="Đơn thuê theo trạng thái" description="Phân bổ toàn bộ đơn thuê trong kỳ">
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-xl bg-sunken text-xs text-ink-3">
          Đang tải phân bổ đơn thuê...
        </div>
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard title="Đơn thuê theo trạng thái" description="Phân bổ toàn bộ đơn thuê trong kỳ">
        <EmptyState title="Chưa có dữ liệu đơn" description="Không có đơn thuê nào được ghi nhận trong khoảng thời gian này." />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Đơn thuê theo trạng thái"
      description={`Tổng cộng ${totalRentals} đơn thuê được ghi nhận`}
      tableData={tableData}
      className="col-span-1"
    >
      <div
        role="img"
        aria-label={`Biểu đồ cột ngang trạng thái đơn thuê, tổng ${totalRentals} đơn`}
        className="h-72 w-full pt-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--line)" />
            <XAxis
              type="number"
              tick={{ fill: "var(--ink-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              tick={{ fill: "var(--ink-2)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
            />
            <Tooltip
              formatter={(value: unknown) => [`${value} đơn`, "Số lượng"]}
              contentStyle={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--line)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "var(--shadow-e2)",
              }}
            />
            <Bar
              dataKey="count"
              name="Số đơn"
              fill={CHART_PALETTE[1]}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
