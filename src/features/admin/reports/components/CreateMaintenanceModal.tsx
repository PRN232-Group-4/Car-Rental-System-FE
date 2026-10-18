"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Wrench } from "lucide-react";
import { formatDate } from "@/lib/time";
import { useCreateMaintenanceFromReport } from "../hooks";
import type { ReportDetail } from "../types";

interface CreateMaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  report: ReportDetail;
}

export function CreateMaintenanceModal({
  open,
  onClose,
  report,
}: CreateMaintenanceModalProps) {
  const [maintenanceType, setMaintenanceType] = useState("Sửa chữa sự cố khẩn cấp");
  const [description, setDescription] = useState(
    `[Tạo từ Báo cáo #${report.id}] ${report.description}`
  );
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return formatDate(tomorrow, "yyyy-MM-dd");
  });
  const [facilityId, setFacilityId] = useState(1);

  const createMutation = useCreateMaintenanceFromReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      reportId: report.id,
      vehicleId: report.rental?.id ? 1 : 1, // Vehicle ID từ context
      facilityId,
      type: maintenanceType,
      description,
      scheduledDate: new Date(scheduledDate).toISOString(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <span>Tạo phiếu bảo dưỡng từ Báo cáo #{report.id}</span>
        </div>
      }
      description="Chuyển thông tin sự cố kỹ thuật sang quy trình bảo dưỡng kỹ thuật của xưởng (BE-24)."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {report.rental && (
          <div className="rounded-xl border border-line bg-sunken p-3 text-xs">
            <span className="font-semibold text-ink">Phương tiện liên quan:</span>{" "}
            <span className="font-bold text-primary">{report.rental.vehicleName}</span>{" "}
            {report.rental.licensePlate && (
              <span className="font-mono text-ink-3">({report.rental.licensePlate})</span>
            )}
          </div>
        )}

        <div>
          <label htmlFor="maint-type" className="block text-xs font-semibold text-ink-2">
            Hạng mục bảo dưỡng
          </label>
          <select
            id="maint-type"
            value={maintenanceType}
            onChange={(e) => setMaintenanceType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Sửa chữa sự cố khẩn cấp">Sửa chữa sự cố khẩn cấp</option>
            <option value="Kiểm tra & Cân chỉnh lốp">Kiểm tra & Cân chỉnh lốp</option>
            <option value="Bảo dưỡng hệ thống điều hòa">Bảo dưỡng hệ thống điều hòa</option>
            <option value="Sửa chữa thân vỏ & Sơn xe">Sửa chữa thân vỏ & Sơn xe</option>
            <option value="Bảo dưỡng động cơ / Pin điện">Bảo dưỡng động cơ / Pin điện</option>
          </select>
        </div>

        <div>
          <label htmlFor="maint-facility" className="block text-xs font-semibold text-ink-2">
            Cơ sở / Xưởng kỹ thuật
          </label>
          <select
            id="maint-facility"
            value={facilityId}
            onChange={(e) => setFacilityId(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={1}>Xưởng kỹ thuật Chi nhánh Quận 1 (Trụ sở chính)</option>
            <option value={2}>Xưởng Chi nhánh Sân bay Tân Sơn Nhất</option>
            <option value={3}>Xưởng Chi nhánh TP. Thủ Đức</option>
          </select>
        </div>

        <div>
          <label htmlFor="maint-date" className="block text-xs font-semibold text-ink-2">
            Ngày dự kiến bắt đầu (GMT+7)
          </label>
          <input
            id="maint-date"
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="maint-desc" className="block text-xs font-semibold text-ink-2">
            Mô tả chi tiết sự cố cần khắc phục
          </label>
          <textarea
            id="maint-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" size="sm" isLoading={createMutation.isPending}>
            Xác nhận tạo phiếu bảo dưỡng
          </Button>
        </div>
      </form>
    </Modal>
  );
}
