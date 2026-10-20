import { CircleDot, User, ShieldCheck, Cpu } from "lucide-react";
import { formatDateTime } from "@/lib/time";
import type { TripTimelineItem } from "../types";

interface TripTimelineProps {
  timeline: TripTimelineItem[];
}

export function TripTimeline({ timeline }: TripTimelineProps) {
  const getActorLabel = (actor: TripTimelineItem["actor"]) => {
    switch (actor) {
      case "customer":
        return { label: "Bạn", icon: User };
      case "staff":
        return { label: "Nhân viên trạm", icon: ShieldCheck };
      case "system":
        return { label: "Hệ thống tự động", icon: Cpu };
      default:
        return { label: "Hệ thống", icon: CircleDot };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Tạo đơn đặt xe thành công";
      case "pre_inspection":
        return "Duyệt yêu cầu và kiểm tra trước thuê";
      case "renting":
        return "Bắt đầu chuyến đi";
      case "post_inspection":
        return "Tiếp nhận trả xe tại trạm";
      case "completed":
        return "Hoàn tất hợp đồng & thanh toán";
      case "cancelled":
        return "Đơn thuê đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
        Lịch sử hành trình (Timeline)
      </h3>

      <ol className="relative border-l border-line ml-3 space-y-6">
        {timeline.map((item, idx) => {
          const { label: actorLabel, icon: ActorIcon } = getActorLabel(item.actor);

          return (
            <li key={idx} className="ml-6 group">
              <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface border-2 border-primary text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <span className="text-sm font-bold text-ink">
                  {getStatusText(item.to)}
                </span>
                <span className="text-xs text-ink-3 font-mono">
                  {formatDateTime(item.at)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-ink-3 mt-1">
                <ActorIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Thực hiện bởi: {actorLabel}</span>
              </div>

              {item.reason && (
                <p className="text-xs text-ink-2 bg-sunken rounded-lg p-2.5 mt-2 leading-relaxed">
                  {item.reason}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
