"use client";

import { useEffect, useState } from "react";
import { getLatestInspectionRecord } from "../api";
import type { InspectionRecord } from "../types";

export default function InspectionShowcase() {
  const [record, setRecord] = useState<InspectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getLatestInspectionRecord().then(data => { if (active) setRecord(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return <section id="kiem-dinh" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
    <h2 className="text-3xl font-black text-ink">Biên bản kiểm tra xe</h2>
    {loading ? <p role="status">Đang tải biên bản...</p> : error ? <p role="alert">Không tải được biên bản kiểm tra.</p> : record ? <div className="mt-6 space-y-3 text-sm text-ink">
      <h3 className="font-bold">{record.vehicleName}</h3>
      <p>Biển số: {record.plateNumber || record.licensePlate || "Chưa có thông tin"}</p>
      <p>Kiểm tra lúc: {record.inspectedAt || "Chưa có thông tin"}</p>
      <p>Kỹ thuật viên: {record.inspectorName || "Chưa có thông tin"}</p>
      {record.odometer && <p>Số km: {record.odometer}</p>}
      {(record.fuelBatteryLevel || record.batteryOrFuelLevel) && <p>Nhiên liệu / pin: {record.fuelBatteryLevel || record.batteryOrFuelLevel}</p>}
      <ul className="space-y-2">{(record.checkItems ?? []).map((item, index) => <li key={`${item.name}-${index}`}>{item.name}: {item.standard} · {item.status === "pass" ? "Đạt" : item.status === "fail" ? "Không đạt" : "Cần lưu ý"}</li>)}</ul>
    </div> : <p role="status">Chưa có biên bản kiểm tra để hiển thị.</p>}
  </section>;
}
