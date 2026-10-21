import { useMounted } from "@/hooks/use-mounted";
import { Users } from "lucide-react";
import { ChartCard } from "@/components/ui/ChartCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { PlanUsageRow } from "../types";

interface PlanUsageChartProps {
  data?: PlanUsageRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function PlanUsageChart({
  data = [],
  isLoading,
  isError,
  onRetry,
}: PlanUsageChartProps) {
  const mounted = useMounted();

  const totalSubscribers = data.reduce((sum, item) => sum + (item.activeSubscribers || 0), 0);

  const tableData = {
    headers: ["Gói đăng ký", "Giờ đã dùng", "Tổng giờ kèm", "Tỉ lệ sử dụng (%)", "Số người đăng ký"],
    rows: data.map((d) => [
      d.name,
      `${d.usedHours} giờ`,
      d.includedHours === null ? "Không giới hạn" : `${d.includedHours} giờ`,
      d.usagePercentage === null ? "Không áp dụng" : `${d.usagePercentage}%`,
      `${d.activeSubscribers} người`,
    ]),
  };

  if (isError) {
    return (
      <ChartCard title="Hiệu quả gói thuê bao" description="Tỉ lệ khai thác giờ sử dụng theo từng gói">
        <ErrorState message="Không thể tải dữ liệu hiệu quả gói thuê bao." onRetry={onRetry} />
      </ChartCard>
    );
  }

  if (isLoading || !mounted) {
    return (
      <ChartCard title="Hiệu quả gói thuê bao" description="Tỉ lệ khai thác giờ sử dụng theo từng gói">
        <div className="flex h-64 w-full animate-pulse items-center justify-center rounded bg-td-chalk text-xs text-td-muted">
          Đang tải dữ liệu gói thuê bao...
        </div>
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard title="Hiệu quả gói thuê bao" description="Tỉ lệ khai thác giờ sử dụng theo từng gói">
        <EmptyState title="Chưa có gói thuê bao" description="Chưa có lượt đăng ký gói nào được ghi nhận." />
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Hiệu quả gói thuê bao"
      description={`Theo dõi ${totalSubscribers} khách hàng đang sử dụng gói hội viên (FR-DASH-04)`}
      tableData={tableData}
      className="col-span-1"
    >
      <div
        role="img"
        aria-label="Danh sách tiến độ tiêu thụ giờ của các gói thuê bao"
        className="flex flex-col gap-4 pt-2"
      >
        {data.map((plan) => {
          const pct = plan.usagePercentage === null ? null : Math.min(plan.usagePercentage, 100);
          return (
            <div key={plan.planId} className="flex flex-col gap-1.5 rounded border border-td-rule bg-td-white p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-td-ink">{plan.name}</span>
                <span className="flex items-center gap-1 font-mono text-xs font-semibold text-td-oxide">
                  <Users className="h-3 w-3 text-td-muted" />
                  {plan.activeSubscribers} hội viên
                </span>
              </div>

              {/* Progress bar */}
              {pct !== null && <div className="relative mt-1 h-3 w-full overflow-hidden rounded-full bg-td-chalk">
                <div
                  className="h-full rounded-full bg-td-oxide transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>}

              <div className="flex items-center justify-between font-mono text-[11px] text-td-muted">
                <span>
                  Đã dùng: <strong className="text-td-ink">{plan.usedHours}</strong> giờ / {plan.includedHours === null ? "Không giới hạn" : `${plan.includedHours} giờ`}
                </span>
                <span className="font-bold text-td-ink">{plan.usagePercentage === null ? "Không áp dụng" : `${plan.usagePercentage}%`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
