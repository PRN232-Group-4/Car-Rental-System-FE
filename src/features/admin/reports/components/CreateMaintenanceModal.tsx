"use client";

import { useState } from "react";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { useQuery } from "@tanstack/react-query";
import { fetchAllStaff, getFacilities } from "@/features/admin/staff/api";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { useInlineValidation, ValidatedForm, InlineInput, InlineSelect } from "@/components/forms/inline-validation";
import { Button } from "@/components/ui/Button";
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
  const maintenanceType = "Sửa chữa sự cố khẩn cấp";
  const description = report.description;
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return formatDate(tomorrow, "yyyy-MM-dd");
  });
  const [facilityId, setFacilityId] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState("");
  const [error, setError] = useState("");
  const validation = useInlineValidation();
  const staff = useQuery({ queryKey: ["report-technicians"], queryFn: fetchAllStaff, enabled: open });
  const facilities = useQuery({ queryKey: ["facilities"], queryFn: getFacilities, enabled: open });
  const technicians = staff.data?.filter((person) => person.roles?.includes("Maintenance")) ?? [];

  const createMutation = useCreateMaintenanceFromReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createMutation.isPending) return;
    setError("");
    try {
      await createMutation.mutateAsync({
        reportId: report.id, assignedStaffId: Number(assignedStaffId),
        facilityId: facilityId ? Number(facilityId) : null, scheduledDate,
      });
      onClose();
    } catch (cause) { setError(validation.report(cause)); }
  };

  if (!open) return null;
  return (
    <FormDialog title={`Tạo phiếu bảo dưỡng từ Báo cáo #${report.id}`} onClose={onClose} busy={createMutation.isPending}>
      <ValidatedForm validation={validation} onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        {(staff.isError || facilities.isError) && <p role="alert" className="text-xs text-danger">Không tải được danh mục. <button type="button" onClick={() => { void staff.refetch(); void facilities.refetch(); }}>Thử lại</button></p>}
        {(staff.isPending || facilities.isPending) && <FormSkeleton />}
        {report.rental && (
          <div className="rounded border border-td-rule bg-td-chalk p-3 text-xs">
            <span className="font-semibold text-td-ink">Phương tiện liên quan:</span>{" "}
            <span className="font-bold text-td-oxide">{report.rental.vehicleName}</span>{" "}
            {report.rental.licensePlate && (
              <span className="font-mono text-td-muted">({report.rental.licensePlate})</span>
            )}
          </div>
        )}

        <div>
          <label htmlFor="maint-type" className="block text-xs font-semibold text-td-ink">
            Hạng mục bảo dưỡng
          </label>
          <select
            id="maint-type"
            value={maintenanceType}
            disabled title="API lấy hạng mục từ báo cáo, chưa hỗ trợ chọn hạng mục riêng"
            className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none focus:ring-1 focus:ring-td-oxide"
          >
            <option value="Sửa chữa sự cố khẩn cấp">Sửa chữa sự cố khẩn cấp</option>
            <option value="Kiểm tra & Cân chỉnh lốp">Kiểm tra & Cân chỉnh lốp</option>
            <option value="Bảo dưỡng hệ thống điều hòa">Bảo dưỡng hệ thống điều hòa</option>
            <option value="Sửa chữa thân vỏ & Sơn xe">Sửa chữa thân vỏ & Sơn xe</option>
            <option value="Bảo dưỡng động cơ / Pin điện">Bảo dưỡng động cơ / Pin điện</option>
          </select>
        </div>

        <div>
          <label htmlFor="maint-facility" className="block text-xs font-semibold text-td-ink">
            Cơ sở / Xưởng kỹ thuật
          </label>
          <InlineSelect
            id="maint-facility" name="facilityId" disabled={createMutation.isPending}
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none focus:ring-1 focus:ring-td-oxide"
          >
            <option value="">Theo cơ sở của xe</option>
            {facilities.data?.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
          </InlineSelect>
        </div>

        <div>
          <label htmlFor="maint-staff" className="block text-xs font-semibold text-td-ink">Kỹ thuật viên phụ trách</label>
          <InlineSelect id="maint-staff" name="assignedStaffId" required disabled={createMutation.isPending} value={assignedStaffId} onChange={(event) => setAssignedStaffId(event.target.value)} className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink">
            <option value="">Chọn kỹ thuật viên</option>{technicians.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
          </InlineSelect>
        </div>
        <div>
          <label htmlFor="maint-date" className="block text-xs font-semibold text-td-ink">
            Ngày dự kiến bắt đầu (GMT+7)
          </label>
          <InlineInput
            id="maint-date" name="scheduledDate" disabled={createMutation.isPending}
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none focus:ring-1 focus:ring-td-oxide"
            required
          />
        </div>

        <div>
          <label htmlFor="maint-desc" className="block text-xs font-semibold text-td-ink">
            Mô tả chi tiết sự cố cần khắc phục
          </label>
          <textarea
            id="maint-desc"
            rows={3}
            value={description}
            readOnly title="API dùng nội dung từ báo cáo, chưa hỗ trợ mô tả riêng"
            className="mt-1 w-full rounded border border-td-rule bg-td-white px-3 py-2 text-xs text-td-ink focus:outline-none focus:ring-1 focus:ring-td-oxide"
            required
          />
        </div>

        <FormDialogFooter>
          <Button type="button" variant="secondary" size="sm" disabled={createMutation.isPending} onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" size="sm" disabled={staff.isPending || facilities.isPending || staff.isError || facilities.isError} isLoading={createMutation.isPending}>
            Xác nhận tạo phiếu bảo dưỡng
          </Button>
        </FormDialogFooter>
      </ValidatedForm>
    </FormDialog>
  );
}
