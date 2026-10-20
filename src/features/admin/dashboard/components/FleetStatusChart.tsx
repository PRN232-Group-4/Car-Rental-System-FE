import { useMounted } from "@/hooks/use-mounted";
import { ChartCard } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FleetStatus } from "../types";

interface FleetStatusChartProps {
  data?: FleetStatus;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const FLEET_LABELS: Record<keyof FleetStatus, { label: string; color: string; desc: string }> = {
  available: { label: "Sẵn sàng đón khách", color: "var(--success, #059669)", desc: "Xe rảnh tại bãi" },
  renting: { label: "Đang được thuê", color: "var(--primary, #B45309)", desc: "Đang trên lộ trình" },
  maintenance: { label: "Bảo dưỡng / Sửa chữa", color: "var(--warning, #D97706)", desc: "Tại xưởng kỹ thuật" },
  inactive: { label: "Tạm ngưng hoạt động", color: "var(--ink-muted, #94A3B8)", desc: "Chờ kiểm định / Lưu kho" },
};

export function FleetStatusChart({ data, isLoading, isError, onRetry }: FleetStatusChartProps) {
  const mounted = useMounted();

  if (isError) {
    return (
      <ChartCard title="Tình trạng đội xe" description="Phân bổ hiện trạng toàn bộ phương tiện">
        <ErrorState message="Không thể tải hiện trạng đội xe." onRetry={onRetry} />
      </ChartCard>
    );
  }

  if (isLoading || !mounted) {
    return (
      <ChartCard title="Tình trạng đội xe" description="Phân bổ hiện trạng toàn bộ phương tiện">
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded bg-td-chalk text-xs text-td-muted">
          Đang tải tình trạng đội xe...
        </div>
      </ChartCard>
    );
  }

  if (!data) {
    return (
      <ChartCard title="Tình trạng đội xe" description="Phân bổ hiện trạng toàn bộ phương tiện">
        <EmptyState title="Chưa có dữ liệu đội xe" description="Hệ thống chưa ghi nhận thông tin xe nào." />
      </ChartCard>
    );
  }

  const total = data.available + data.renting + data.maintenance + data.inactive;

  const tableData = {
    headers: ["Trạng thái", "Số lượng xe", "Tỉ lệ (%)"],
    rows: (["available", "renting", "maintenance", "inactive"] as const).map((key) => {
      const count = data[key] || 0;
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
      return [FLEET_LABELS[key].label, count, `${pct}%`];
    }),
  };

  const getPercent = (count: number) => (total > 0 ? (count / total) * 100 : 0);

  return (
    <ChartCard
      title="Tình trạng đội xe"
      description={`Tổng cộng ${total} phương tiện trên toàn hệ thống`}
      tableData={tableData}
      className="col-span-1"
    >
      <div
        role="img"
        aria-label={`Biểu đồ phân bổ ${total} xe: ${data.available} sẵn sàng, ${data.renting} đang thuê, ${data.maintenance} bảo dưỡng, ${data.inactive} ngưng hoạt động`}
        className="flex flex-col justify-between gap-5 pt-2"
      >
        {/* Thanh xếp chồng 1 thanh (Stacked Single Bar) */}
        <div>
          <div className="flex h-7 w-full overflow-hidden rounded border border-td-rule bg-td-chalk p-0.5">
            {data.available > 0 && (
              <div
                style={{ width: `${getPercent(data.available)}%` }}
                className="bg-success transition-all"
                title={`Sẵn sàng: ${data.available} xe (${getPercent(data.available).toFixed(1)}%)`}
              />
            )}
            {data.renting > 0 && (
              <div
                style={{ width: `${getPercent(data.renting)}%` }}
                className="bg-td-oxide transition-all"
                title={`Đang thuê: ${data.renting} xe (${getPercent(data.renting).toFixed(1)}%)`}
              />
            )}
            {data.maintenance > 0 && (
              <div
                style={{ width: `${getPercent(data.maintenance)}%` }}
                className="bg-warning transition-all"
                title={`Bảo dưỡng: ${data.maintenance} xe (${getPercent(data.maintenance).toFixed(1)}%)`}
              />
            )}
            {data.inactive > 0 && (
              <div
                style={{ width: `${getPercent(data.inactive)}%` }}
                className="bg-ink-3/40 transition-all"
                title={`Ngưng hoạt động: ${data.inactive} xe (${getPercent(data.inactive).toFixed(1)}%)`}
              />
            )}
          </div>
        </div>

        {/* Danh sách nhãn trực tiếp và số lượng */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {(["available", "renting", "maintenance", "inactive"] as const).map((key) => {
            const count = data[key] || 0;
            const pct = getPercent(count).toFixed(1);
            const info = FLEET_LABELS[key];
            return (
              <div key={key} className="flex flex-col rounded border border-td-rule bg-td-white p-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: info.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-td-ink">{info.label}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-xl font-bold text-td-ink">{count}</span>
                  <span className="font-mono text-xs text-td-muted">{pct}%</span>
                </div>
                <span className="mt-1 text-[11px] text-td-muted">{info.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
}
