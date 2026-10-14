"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { defaultApiClient } from "@/api/default-api-client";
import { getCustomerLicense } from "@/features/licenses";
import { getMySubscriptions } from "@/features/subscriptions";
import { getInvoices, mapInvoiceFromBE } from "@/features/invoices/api";
import { createRentalBooking, getBookingPolicies, getBookingVehicles } from "../api";
import { calculateHourlyEstimate, localDateTime, selectBookingPolicy, validateBookingTimes } from "../booking-rules";
import type { RentalBookingResponse } from "../types";

const inputClass = "mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-ink";
const money = (value: number) => `${value.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} đ`;
const iso = (value: string) => Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : undefined;
const errorText = (error: unknown) => error instanceof Error && !(error instanceof TypeError) ? error.message : "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.";

export default function BookingForm() {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const [rentalType, setRentalType] = useState(params.get("mode") === "longterm" ? "longterm" : "hourly");
  const [vehicleId, setVehicleId] = useState(params.get("vehicleId") ?? "");
  const [subscriptionId, setSubscriptionId] = useState(params.get("subscriptionId") ?? "");
  const [paymentMode, setPaymentMode] = useState(params.get("subscriptionId") ? "subscription" : "direct");
  const [startTime, setStartTime] = useState(() => params.get("startTime") ?? localDateTime(new Date(Date.now() + 86400000)));
  const [endTime, setEndTime] = useState(() => params.get("endTime") ?? localDateTime(new Date(Date.now() + 2 * 86400000)));
  const [hasDriver, setHasDriver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const [result, setResult] = useState<RentalBookingResponse | null>(null);
  const [resultType, setResultType] = useState("hourly");
  const [resultIsSubscription, setResultIsSubscription] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | number | undefined>();
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const validation = useInlineValidation();
  const [sessionStartedAt] = useState(Date.now);
  const from = iso(startTime);
  const to = iso(endTime);
  const facilityId = params.get("facilityId") || undefined;
  const vehiclesQuery = useQuery({ queryKey: ["booking-vehicles", from, to, facilityId], queryFn: () => getBookingVehicles(from, to, facilityId) });
  const policyQuery = useQuery({ queryKey: ["booking-policies"], queryFn: getBookingPolicies, retry: false });
  const licenseQuery = useQuery({ queryKey: ["customer-license"], queryFn: getCustomerLicense });
  const subscriptionsQuery = useQuery({ queryKey: ["my-subscriptions"], queryFn: getMySubscriptions, enabled: rentalType === "hourly" && paymentMode === "subscription" });
  const vehicle = vehiclesQuery.data?.find((item) => String(item.id) === vehicleId);
  const policy = selectBookingPolicy(policyQuery.data ?? [], vehicle?.vehicleTypeId);
  const hours = from && to ? Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / 3600000) : 0;
  const subscriptions = (subscriptionsQuery.data ?? []).filter((item) => item.status === "active" && new Date(item.endDate).getTime() > sessionStartedAt);
  const subscription = subscriptions.find((item) => String(item.id) === subscriptionId);
  const estimate = vehicle && policy && rentalType === "hourly" ? calculateHourlyEstimate(vehicle.hourlyPrice, hours, policy) : null;

  const validate = () => ({
    ...validateBookingTimes(startTime, endTime),
    vehicleId: !vehicle ? "Vui lòng chọn xe khả dụng trong khoảng thời gian thuê." : undefined,
    licenseStatus: paymentMode === "direct" && licenseQuery.data?.status !== "approved" ? "GPLX chưa được duyệt. Vui lòng cập nhật giấy phép trước khi đặt xe." : undefined,
    subscriptionId: paymentMode === "subscription" ? (!subscription ? "Vui lòng chọn gói thuê bao còn hiệu lực." : subscription.remainingHours < hours ? `Gói còn ${subscription.remainingHours} giờ, chưa đủ ${hours} giờ thuê. Hãy chọn gói khác hoặc giảm thời gian.` : undefined) : undefined,
  });

  const submit = async () => {
    if (submissionLock.current || !vehicle || !from || !to) return;
    submissionLock.current = true;
    setSubmitting(true);
    setGeneralError("");
    try {
      const created = await createRentalBooking({ rentalType, vehicleId: vehicle.id, startTime: from, endTime: to, hasDriver, policyId: policy?.id, subscriptionId: paymentMode === "subscription" ? subscriptionId : undefined });
      setResult(created);
      setResultType(rentalType);
      setResultIsSubscription(paymentMode === "subscription");
      setInvoiceId(created.invoiceId);
      void queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["booking-vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (error) {
      setSubmitting(false);
      submissionLock.current = false;
      const message = validation.report(error);
      setGeneralError(error instanceof TypeError ? errorText(error) : message);
    } finally { setSubmitting(false); submissionLock.current = false; }
  };

  const prepareInvoice = async () => {
    if (!result?.bookingId || loadingInvoice) return;
    setLoadingInvoice(true);
    setGeneralError("");
    try {
      const existing = (await getInvoices()).find((item) => String(item.rentalId) === String(result.bookingId));
      const invoice = existing ?? mapInvoiceFromBE(await defaultApiClient.post<Record<string, unknown>>(`rentals/${encodeURIComponent(result.bookingId)}/invoice`));
      if (!invoice.id) throw new Error("Chưa nhận được mã hóa đơn. Vui lòng kiểm tra danh sách hóa đơn hoặc liên hệ chi nhánh.");
      setInvoiceId(invoice.id);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (error) { setGeneralError(errorText(error)); }
    finally { setLoadingInvoice(false); }
  };

  if (result) return <section className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-live="polite">
    <h1 className="text-2xl font-bold">Đặt xe thành công</h1>
    <p>{result.bookingId ? `Mã đơn thuê: #${result.bookingId}` : "Máy chủ đã tiếp nhận đơn thuê. Vui lòng liên hệ chi nhánh để tra cứu mã đơn."}</p>
    {result.rental && <div className="space-y-2 rounded-xl bg-canvas p-4"><p>Trạng thái: {result.rental.status}</p><p>Tổng tiền thuê từ máy chủ: {money(result.rental.totalPrice)}</p><p>Tiền cọc: {money(result.rental.depositPrice)}</p></div>}
    {resultIsSubscription ? <p>Đơn thuê dùng gói thuê bao. Bạn có thể kiểm tra số giờ còn lại trong Gói của tôi.</p> : <p>Kiểm tra hóa đơn để xem số tiền thanh toán chính xác.</p>}
    {generalError && <p role="alert" className="text-red-700">{generalError}</p>}
    <div className="flex flex-wrap gap-3">
      {result.bookingId && <Link href={`/report-incident?rentalId=${encodeURIComponent(result.bookingId)}`} className="rounded-xl border border-border px-4 py-3">Báo cáo sự cố của đơn</Link>}
      {resultType === "longterm" && result.bookingId && <Link className="rounded-xl bg-primary px-4 py-3 text-white" href={`/rental-contract?rentalId=${encodeURIComponent(result.bookingId)}`}>Xem hợp đồng</Link>}
      {!resultIsSubscription && (invoiceId ? <Link className="rounded-xl bg-primary px-4 py-3 text-white" href={`/invoices/${invoiceId}`}>Xem hóa đơn và thanh toán</Link> : result.bookingId && <button type="button" onClick={prepareInvoice} disabled={loadingInvoice} className="rounded-xl bg-primary px-4 py-3 text-white disabled:opacity-50">{loadingInvoice ? "Đang kiểm tra hóa đơn..." : "Kiểm tra / tạo hóa đơn"}</button>)}
      <Link href={resultIsSubscription ? "/my-subscriptions" : "/invoices"} className="rounded-xl border border-border px-4 py-3">{resultIsSubscription ? "Gói của tôi" : "Danh sách hóa đơn"}</Link>
      <button type="button" className="rounded-xl border border-border px-4 py-3" onClick={() => { setResult(null); setGeneralError(""); validation.reset(); }}>Tạo đơn khác</button>
    </div>
  </section>;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold sm:text-3xl">Tạo đơn thuê xe</h1><p className="mt-2 text-sm text-ink-muted">Chọn hình thức thuê, thời gian và phương tiện phù hợp.</p></div>
    <ValidatedForm validation={validation} validate={validate} onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="min-w-0 space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6" aria-label="Thông tin đặt xe">
        <div><label htmlFor="rentalType" className="text-sm font-semibold">Hình thức thuê</label><InlineSelect id="rentalType" name="rentalType" className={inputClass} value={rentalType} onChange={(event) => { setRentalType(event.target.value); if (event.target.value === "longterm") { setPaymentMode("direct"); setHasDriver(false); } }}><option value="hourly">Thuê theo giờ</option><option value="longterm">Thuê dài hạn</option></InlineSelect></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="startTime" className="text-sm font-semibold">Ngày giờ nhận xe</label><InlineInput id="startTime" name="startTime" type="datetime-local" required className={inputClass} value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>
          <div><label htmlFor="endTime" className="text-sm font-semibold">Ngày giờ trả xe</label><InlineInput id="endTime" name="endTime" type="datetime-local" required className={inputClass} value={endTime} onChange={(event) => setEndTime(event.target.value)} /></div>
        </div>
        <div><label htmlFor="vehicleId" className="text-sm font-semibold">Phương tiện khả dụng</label><InlineSelect id="vehicleId" name="vehicleId" required value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className={inputClass} disabled={vehiclesQuery.isFetching}><option value="">{vehiclesQuery.isFetching ? "Đang kiểm tra xe..." : "Chọn phương tiện"}</option>{(vehiclesQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} — {item.facilityName}</option>)}</InlineSelect>
          {vehiclesQuery.error && <p role="alert" className="mt-2 text-sm text-red-700">{errorText(vehiclesQuery.error)} <button type="button" onClick={() => void vehiclesQuery.refetch()} className="underline">Thử lại</button></p>}
          {!vehiclesQuery.isPending && !vehiclesQuery.error && !vehiclesQuery.data?.length && <p className="mt-2 text-sm text-ink-muted">Không có xe khả dụng. Vui lòng chọn khoảng thời gian khác.</p>}
        </div>
        {rentalType === "hourly" && <div><label htmlFor="hasDriver" className="text-sm font-semibold">Tài xế</label><InlineSelect id="hasDriver" name="hasDriver" className={inputClass} value={String(hasDriver)} onChange={(event) => setHasDriver(event.target.value === "true")}><option value="false">Tự lái</option><option value="true">Có tài xế</option></InlineSelect></div>}
        {rentalType === "hourly" && <div><label htmlFor="paymentMode" className="text-sm font-semibold">Thanh toán</label><InlineSelect id="paymentMode" name="paymentMode" className={inputClass} value={paymentMode} onChange={(event) => { setPaymentMode(event.target.value); validation.clear("licenseStatus"); validation.clear("subscriptionId"); }}><option value="direct">Thanh toán trực tiếp</option><option value="subscription">Dùng gói thuê bao</option></InlineSelect></div>}
        {paymentMode === "subscription" ? <div><label htmlFor="subscriptionId" className="text-sm font-semibold">Gói thuê bao</label><InlineSelect id="subscriptionId" name="subscriptionId" required className={inputClass} value={subscriptionId} onChange={(event) => setSubscriptionId(event.target.value)}><option value="">Chọn gói còn hiệu lực</option>{subscriptions.map((item) => <option key={item.id} value={item.id}>{item.planName} — còn {item.remainingHours} giờ</option>)}</InlineSelect>{subscriptionsQuery.error && <p role="alert" className="mt-2 text-sm text-red-700">{errorText(subscriptionsQuery.error)}</p>}<Link href="/my-subscriptions" className="mt-2 inline-block text-sm text-primary underline">Quản lý gói của tôi</Link></div> : <div><label htmlFor="licenseStatus" className="text-sm font-semibold">Giấy phép lái xe</label><InlineInput id="licenseStatus" name="licenseStatus" readOnly className={inputClass} value={licenseQuery.isPending ? "Đang kiểm tra..." : licenseQuery.data?.status === "approved" ? "Đã được duyệt" : "Chưa được duyệt"} />{licenseQuery.error && <p role="alert" className="mt-2 text-sm text-red-700">{errorText(licenseQuery.error)}</p>}<Link href="/driver-license" className="mt-2 inline-block text-sm text-primary underline">Cập nhật / kiểm tra GPLX</Link></div>}
      </section>
      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold">Tóm tắt đặt xe</h2>
        <p className="text-sm">{vehicle?.name ?? "Chưa chọn phương tiện"}</p><p className="text-sm text-ink-muted">Thời gian: {hours.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ</p>
        {vehicle && <p className="text-sm">Đơn giá: {money(rentalType === "longterm" ? vehicle.monthlyPrice : vehicle.hourlyPrice)} / {rentalType === "longterm" ? "tháng" : "giờ"}</p>}
        {paymentMode === "subscription" ? <p className="text-sm">Sử dụng giờ trong gói thuê bao, không tạo hóa đơn thuê trực tiếp.</p> : <>
          {policy && <p className="text-sm">Chính sách: {policy.name ?? `#${policy.id}`}<br />VAT {policy.vatRate}% · Cọc {policy.depositPercentage}%</p>}
          {estimate && <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>Tiền thuê dự kiến</dt><dd>{money(estimate.rentalFee)}</dd></div><div className="flex justify-between"><dt>VAT</dt><dd>{money(estimate.vat)}</dd></div><div className="flex justify-between"><dt>Tiền cọc</dt><dd>{money(estimate.deposit)}</dd></div><div className="flex justify-between border-t border-border pt-3 font-bold"><dt>Tạm tính gồm cọc</dt><dd>{money(estimate.total)}</dd></div></dl>}
          <p className="text-xs text-ink-muted">{rentalType === "longterm" ? "Tiền thuê dài hạn được máy chủ xác định theo khoảng thời gian và giá tháng." : "Bảng giá là dự toán. Số tiền chính thức được xác nhận trên đơn thuê và hóa đơn."}{hasDriver ? " Chi phí có tài xế được xác nhận bởi máy chủ." : ""}</p>
          {policyQuery.error && <p className="text-sm text-ink-muted">Chưa tải được chính sách. Máy chủ sẽ áp dụng chính sách khi tạo đơn. <button type="button" className="underline" onClick={() => void policyQuery.refetch()}>Tải lại</button></p>}
        </>}
        {generalError && <p role="alert" className="text-sm text-red-700">{generalError}</p>}
        <button type="submit" disabled={submitting || vehiclesQuery.isFetching || licenseQuery.isPending} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Đang gửi yêu cầu..." : "Xác nhận đặt xe"}</button>
        <Link href="/rental-contract" className="block text-center text-sm text-primary underline">Tra cứu hợp đồng thuê dài hạn</Link>
      </aside>
    </ValidatedForm>
  </div>;
}
