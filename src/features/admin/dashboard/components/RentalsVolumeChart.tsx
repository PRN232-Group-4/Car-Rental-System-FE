import { useMounted } from "@/hooks/use-mounted";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartCard } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RevenuePoint } from "../types";

interface RentalsVolumeChartProps {
  data?: RevenuePoint[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/**
 * Số lượt thuê theo thời gian: số lượt **thực sự bắt đầu** trong từng ngày của kỳ đang lọc
 * (backend tính `started_at`, bỏ đơn đã hủy) — cùng nguồn với chuỗi doanh thu nên không phát sinh
 * thêm request và luôn khớp bộ lọc thời gian/cơ sở/loại xe đang chọn.
 */
export function RentalsVolumeChart({ data = [], isLoading, isError, onRetry }: RentalsVolumeChartProps) {
  const mounted = useMounted();

  // Backend cũ chưa trả `rentals` ⇒ không vẽ biểu đồ toàn số 0 (tránh hiểu nhầm là "không có chuyến nào").
  const hasRentalsData = data.some((point) => typeof point.rentals === "number");
  const total = data.reduce((sum, item) => sum + (item.rentals || 0), 0);
  const previousTotal = data.reduce((sum, item) => sum + (item.previousRentals || 0), 0);
  const peak = data.reduce((best, item) => ((item.rentals || 0) > (best?.rentals || 0) ? item : best), data[0]);

  const tableData = {
    headers: ["Ngày (GMT+7)", "Số lượt thuê", "Lượt bắt đầu kỳ trước"],
    rows: data.map((point) => [
      point.bucket,
      point.rentals ?? 0,
      point.previousRentals ?? 0,
    ]),
  };

  function renderBody() {
    if (isLoading || !mounted) {
      return (
        <div className="flex h-64 w-full items-center justify-center rounded bg-td-chalk text-xs text-td-muted" role="status">
          Đang tải biểu đồ số lượt thuê...
        </div>
      );
    }

    if (data.length === 0) {
      return <EmptyState title="Chưa có dữ liệu lượt thuê" description="Không có chuyến nào bắt đầu trong khoảng thời gian này." />;
    }

    if (!hasRentalsData) {
      return (
        <EmptyState
          title="Chưa có số liệu lượt thuê"
          description="Máy chủ chưa trả số lượt thuê cho chuỗi ngày này. Cần cập nhật backend mới rồi tải lại."
        />
      );
    }

    return (
      <div role="img" aria-label={`Biểu đồ đường số lượt thuê theo ngày, tổng ${total} lượt`} className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="bucket"
              tick={{ fill: "var(--td-ink-muted, var(--ink-3))", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "var(--td-ink-muted, var(--ink-3))", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
            />
            <Tooltip
              formatter={(value: unknown) => [`${Number(value ?? 0)} lượt`, "Số lượt thuê"]}
              labelFormatter={(label: unknown) => `Ngày ${String(label)}`}
              contentStyle={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--line)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "var(--shadow-e2)",
                color: "var(--ink)",
              }}
              itemStyle={{ color: "var(--ink)" }}
              labelStyle={{ color: "var(--ink-2)", fontWeight: 600 }}
            />
            <Line
              type="monotone"
              dataKey="rentals"
              name="Số lượt thuê"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <ChartCard
      title="Số lượt thuê theo thời gian"
      description={
        data.length && hasRentalsData
          ? `Kỳ này: ${total} lượt · Kỳ trước: ${previousTotal} lượt${peak ? ` · Cao nhất ${peak.rentals ?? 0} lượt ngày ${peak.bucket}` : ""}`
          : "Số chuyến thực tế bắt đầu theo từng ngày"
      }
      tableData={tableData}
      className="col-span-1 lg:col-span-3"
    >
      {isError ? (
        <ErrorState message="Không thể tải biểu đồ số lượt thuê." onRetry={onRetry} />
      ) : (
        renderBody()
      )}
    </ChartCard>
  );
}

export default RentalsVolumeChart;
