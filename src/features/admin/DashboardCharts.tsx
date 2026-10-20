"use client";

import { useId, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartColumn, ChartPie, RefreshCw, Table2 } from "lucide-react";
import { AdminTable, AdminTableCard } from "@/components/admin/AdminTable";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import { activityChartItems, chartScale, getDashboardFleet, type DashboardChartItem, type DashboardSnapshot } from "./dashboard-data";

const number = new Intl.NumberFormat("vi-VN");
const percent = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded border border-td-rule bg-td-white px-3 text-xs font-semibold text-td-ink hover:bg-td-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50";

export function DashboardCharts({ data, loading, error, onRetry }: { data?: DashboardSnapshot; loading: boolean; error: string; onRetry: () => void }) {
  const fleet = useQuery({ queryKey: ["admin-dashboard-fleet"], queryFn: getDashboardFleet, staleTime: 30_000, retry: false });
  const activities = data ? activityChartItems(data) : [];
  return <section aria-label="Biểu đồ tổng quan" className="grid min-w-0 gap-6 xl:grid-cols-2">
    <ChartCard title="Hoạt động hiện tại" description="Số lượng đơn đang thuê, phiếu bảo dưỡng mở và gói thuê còn hiệu lực." kind="bar" items={activities} loading={loading} error={error} onRetry={onRetry} empty="Chưa có hoạt động để hiển thị." />
    <ChartCard title="Cơ cấu đội xe" description="Tỷ trọng phương tiện theo trạng thái hiện tại trong danh mục xe." kind="pie" items={fleet.data ?? []} loading={fleet.isPending} error={fleet.isError ? (fleet.error instanceof Error ? fleet.error.message : "Không thể tải cơ cấu đội xe.") : ""} onRetry={() => { void fleet.refetch(); }} empty="Chưa có phương tiện trong hệ thống." />
  </section>;
}

function ChartCard({ title, description, kind, items, loading, error, onRetry, empty }: {
  title: string; description: string; kind: "bar" | "pie"; items: DashboardChartItem[]; loading: boolean; error: string; onRetry: () => void; empty: string;
}) {
  const [table, setTable] = useState(false);
  const id = useId();
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const Icon = kind === "bar" ? ChartColumn : ChartPie;
  let content: ReactNode;
  if (loading) content = <SkeletonBlock label={`Đang tải ${title.toLocaleLowerCase()}...`} className="flex min-h-72 items-end gap-5 px-5 pb-6"><Skeleton className="h-32 flex-1" /><Skeleton className="h-56 flex-1" /><Skeleton className="h-44 flex-1" /></SkeletonBlock>;
  else if (error) content = <div className="flex min-h-72 flex-col items-start justify-center gap-4 p-5"><p role="alert" className="text-sm text-danger">{error}</p><button type="button" className={button} onClick={onRetry}><RefreshCw aria-hidden="true" className="h-4 w-4" />Thử lại</button></div>;
  else if (!items.length || total === 0) content = <p role="status" className="flex min-h-72 items-center justify-center px-5 text-center text-sm text-td-muted">{empty}</p>;
  else content = <>
    {!table && (kind === "bar" ? <ActivityBars items={items} /> : <FleetPie items={items} total={total} />)}
    <div id={`${id}-table`} className={table ? "min-h-72" : "sr-only"}>
      <AdminTable aria-label={`Dữ liệu ${title.toLocaleLowerCase()}`}>
        <thead><tr><th scope="col">{kind === "pie" ? "Trạng thái" : "Chỉ số"}</th><th scope="col">Số lượng{kind === "pie" ? " xe" : ""}</th>{kind === "pie" && <th scope="col">Tỷ trọng</th>}</tr></thead>
        <tbody>{items.map((item) => <tr key={item.key}><th scope="row">{item.label}</th><td className="font-mono tabular-nums">{number.format(item.value)}</td>{kind === "pie" && <td className="font-mono tabular-nums">{percent.format(item.value / total * 100)}%</td>}</tr>)}</tbody>
      </AdminTable>
    </div>
  </>;
  return <AdminTableCard aria-labelledby={`${id}-title`} aria-busy={loading} className="min-w-0">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-td-rule p-5">
      <div className="min-w-0 flex-1"><h3 id={`${id}-title`} className="flex items-center gap-2 font-bold text-td-ink"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-td-oxide" />{title}</h3><p className="mt-2 text-xs leading-5 text-td-muted">{description}</p></div>
      <button type="button" disabled={loading || !!error || !total} onClick={() => setTable(!table)} aria-pressed={table} aria-controls={`${id}-table`} className={button}><Table2 aria-hidden="true" className="h-4 w-4" />{table ? "Xem biểu đồ" : "Xem dạng bảng"}</button>
    </div>
    {content}
  </AdminTableCard>;
}

function ActivityBars({ items }: { items: DashboardChartItem[] }) {
  const scale = chartScale(Math.max(...items.map((item) => item.value)));
  const summary = items.map((item) => `${item.label}: ${number.format(item.value)}`).join("; ");
  return <div className="p-5">
    <p className="mb-2 text-xs text-td-muted">Đơn vị: số lượng</p>
    <div role="img" aria-label={`Biểu đồ cột hoạt động hiện tại. ${summary}`} className="pb-2 pt-5">
      <div aria-hidden="true" className="relative ml-10 h-48 border-b border-td-rule">
        {scale.ticks.map((tick) => <div key={tick} className="absolute right-0 left-0 border-t border-dashed border-td-rule" style={{ bottom: `${tick / scale.max * 100}%` }}><span className="absolute right-full -translate-y-1/2 pr-2 text-xs tabular-nums text-td-muted">{tick < 1000 ? number.format(tick) : new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(tick)}</span></div>)}
        <div className="absolute inset-0 grid items-end gap-4 px-3 sm:gap-6" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => <div key={item.key} className="relative mx-auto w-full max-w-14 rounded-t" style={{ height: `${item.value / scale.max * 100}%`, backgroundColor: item.color }}><span className="absolute -top-6 right-0 left-0 text-center font-mono text-sm font-semibold tabular-nums text-td-ink">{number.format(item.value)}</span></div>)}
        </div>
      </div>
      <div aria-hidden="true" className="mt-3 ml-10 grid gap-3 text-center text-xs leading-5 text-td-muted" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>{items.map((item) => <span key={item.key}>{item.label}</span>)}</div>
    </div>
    {items.length < 3 && <p className="text-xs text-td-muted">Một số chỉ số chưa được API cung cấp.</p>}
  </div>;
}

function FleetPie({ items, total }: { items: DashboardChartItem[]; total: number }) {
  const segments = items.map((item, index) => ({ ...item, start: items.slice(0, index).reduce((sum, previous) => sum + previous.value / total * 100, 0), share: item.value / total * 100 }));
  return <div className="flex min-h-72 flex-col items-center justify-center gap-5 p-5 sm:flex-row">
    <svg role="img" aria-label={`Biểu đồ tròn cơ cấu ${number.format(total)} xe. ${segments.map((item) => `${item.label}: ${number.format(item.value)} xe, ${percent.format(item.share)}%`).join("; ")}`} viewBox="0 0 220 220" className="h-52 w-52 shrink-0">
      {segments.filter((item) => item.value > 0).map((item) => <circle key={item.key} cx="110" cy="110" r="80" pathLength="100" fill="none" stroke={item.color} strokeWidth="32" strokeDasharray={`${item.share} ${100 - item.share}`} strokeDashoffset={-item.start} transform="rotate(-90 110 110)"><title>{item.label}: {number.format(item.value)} xe ({percent.format(item.share)}%)</title></circle>)}
      <text x="110" y="109" textAnchor="middle" fill="var(--ink)" fontSize="28" fontWeight="700">{number.format(total)}</text>
      <text x="110" y="131" textAnchor="middle" fill="var(--ink-3)" fontSize="12">phương tiện</text>
    </svg>
    <ul className="w-full min-w-0 space-y-4 text-sm">{segments.map((item) => <li key={item.key} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
      <span className="flex items-center gap-2 text-td-ink"><span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />{item.label}</span>
      <span className="font-mono text-xs font-semibold tabular-nums text-td-ink">{number.format(item.value)} xe <span className="font-normal text-td-muted">({percent.format(item.share)}%)</span></span>
    </li>)}</ul>
  </div>;
}
