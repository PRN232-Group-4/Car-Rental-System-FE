"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/navigation/NavigationLink";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InlineInput, InlineSelect, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import { getCustomerLicense } from "@/features/licenses";
import { getMySubscriptions } from "@/features/subscriptions";
import { getInvoices } from "@/features/invoices/api";
import { createRentalBooking, getBookingPolicies, getBookingVehicles } from "../api";
import { calculateHourlyEstimate, localDateTime, selectBookingPolicy, validateBookingTimes } from "../booking-rules";
import type { RentalBookingResponse } from "../types";
import VehicleImage from "@/components/ui/VehicleImage";
import VehicleName from "@/features/admin/VehicleName";
import { Skeleton, SkeletonBlock } from "@/components/ui/Skeleton";
import BookingPickupMap from "@/features/facilities/components/BookingPickupMap";
import BookingVehicleCards from "./BookingVehicleCards";
import { getFacilities } from "@/features/facilities";

const inputClass = "mt-2 w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink";
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
  const [paymentMethod, setPaymentMethod] = useState<"payos" | "cash">("payos");
  const [startTime, setStartTime] = useState(() => params.get("startTime") ?? localDateTime(new Date(Date.now() + 86400000)));
  const [endTime, setEndTime] = useState(() => params.get("endTime") ?? localDateTime(new Date(Date.now() + 2 * 86400000)));
  const [facilityId, setFacilityId] = useState(params.get("facilityId") ?? "");
  const [driverChoice, setDriverChoice] = useState(params.get("hasDriver") === "true" ? "true" : params.get("hasDriver") === "false" ? "false" : "");
  const hasDriver = rentalType === "hourly" && driverChoice === "true";
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
  const facilitiesQuery = useQuery({ queryKey: ["facilities"], queryFn: getFacilities, retry: false });
  const facility = facilitiesQuery.data?.find((item) => item.id === facilityId);
  const canChooseVehicle = !!facility && driverChoice !== "";
  const vehiclesQuery = useQuery({
    queryKey: ["booking-vehicles", from, to, facilityId, hasDriver, rentalType],
    queryFn: ({ signal }) => getBookingVehicles(from, to, facilityId, hasDriver, rentalType, signal),
    enabled: canChooseVehicle && !!from && !!to && new Date(to) > new Date(from),
    retry: false,
  });
  const policyQuery = useQuery({ queryKey: ["booking-policies"], queryFn: getBookingPolicies, retry: false });
  const licenseQuery = useQuery({ queryKey: ["customer-license"], queryFn: getCustomerLicense });
  const subscriptionsQuery = useQuery({ queryKey: ["my-subscriptions"], queryFn: getMySubscriptions, enabled: rentalType === "hourly" && paymentMode === "subscription" });
  const vehicle = canChooseVehicle ? vehiclesQuery.data?.find((item) => String(item.id) === vehicleId && String(item.facilityId) === facilityId) : undefined;
  const policy = selectBookingPolicy(policyQuery.data ?? [], vehicle?.vehicleTypeId);
  const hours = from && to ? Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / 3600000) : 0;
  const subscriptions = (subscriptionsQuery.data ?? []).filter((item) => item.status === "active" && new Date(item.endDate).getTime() > sessionStartedAt);
  const subscription = subscriptions.find((item) => String(item.id) === subscriptionId);
  const estimate = vehicle && policy && rentalType === "hourly" ? calculateHourlyEstimate(vehicle.hourlyPrice, hours, policy) : null;

  const validate = () => ({
    facilityId: !facility ? "Vui lòng chọn cơ sở nhận xe trong danh sách." : undefined,
    hasDriver: facility && !driverChoice ? "Vui lòng chọn tự lái hoặc có tài xế." : undefined,
    ...validateBookingTimes(startTime, endTime),
    vehicleId: canChooseVehicle && !vehicle ? "Vui lòng chọn xe khả dụng trong khoảng thời gian thuê." : undefined,
    licenseStatus: paymentMode === "direct" && licenseQuery.data?.status !== "approved" ? "GPLX chưa được duyệt. Vui lòng cập nhật giấy phép trước khi đặt xe." : undefined,
    subscriptionId: paymentMode === "subscription" ? (!subscription ? "Vui lòng chọn gói thuê bao còn hiệu lực." : subscription.remainingHours < hours ? `Gói còn ${subscription.remainingHours} giờ, chưa đủ ${hours} giờ thuê. Hãy chọn gói khác hoặc giảm thời gian.` : undefined) : undefined,
  });

  const submit = async () => {
    if (submissionLock.current || !vehicle || !from || !to || vehiclesQuery.isFetching || vehiclesQuery.isError) return;
    submissionLock.current = true;
    setSubmitting(true);
    setGeneralError("");
    try {
      const created = await createRentalBooking({ rentalType, vehicleId: vehicle.id, startTime: from, endTime: to, hasDriver, paymentMethod, policyId: policy?.id, subscriptionId: paymentMode === "subscription" ? subscriptionId : undefined });
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
      const invoice = existing;
      if (!invoice?.id) throw new Error("Chưa tìm thấy hóa đơn của đơn thuê. Vui lòng thử lại hoặc liên hệ chi nhánh.");
      setInvoiceId(invoice.id);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    } catch (error) { setGeneralError(errorText(error)); }
    finally { setLoadingInvoice(false); }
  };

  if (result) return <section className="mx-auto max-w-3xl space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8" aria-live="polite">
    <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Đã gửi yêu cầu đặt xe</h1>
    <p>{result.bookingId ? `Mã yêu cầu: #${result.bookingId}` : "Máy chủ đã tiếp nhận yêu cầu đặt xe. Vui lòng liên hệ chi nhánh để tra cứu."}</p>
    {result.rental && <VehicleName vehicleId={result.rental.vehicleId} />}
    {result.rental && <div className="space-y-2 rounded-xl bg-canvas p-4"><p>Trạng thái: {result.rental.status}</p><p>Tổng tiền thuê từ máy chủ: {money(result.rental.totalPrice)}</p><p>Tiền cọc: {money(result.rental.depositPrice)}</p></div>}
    {resultIsSubscription ? <p>Yêu cầu dùng gói thuê bao đang chờ nhân viên duyệt. Đơn thuê chính thức được phát hành sau khi duyệt.</p> : <p>Yêu cầu đang chờ nhân viên duyệt. {paymentMethod === "cash" ? "Sau khi được duyệt, bạn thanh toán tiền mặt tại cơ sở; nhân viên xác nhận đã thu tiền để phát hành đơn thuê chính thức." : "Sau khi được duyệt, bạn thanh toán PayOS trong chi tiết hóa đơn. Đơn thuê chính thức chỉ được phát hành khi hệ thống xác nhận đã nhận tiền."}</p>}
    {generalError && <p role="alert" className="text-danger">{generalError}</p>}
    <div className="flex flex-wrap gap-3">
      {result.bookingId && <Link href={`/my-rentals?rentalId=${encodeURIComponent(result.bookingId)}#rental-progress`} className="rounded-xl border border-line-strong px-4 py-3">Theo dõi tiến trình thuê xe</Link>}
      {result.bookingId && <Link href={`/report-incident?rentalId=${encodeURIComponent(result.bookingId)}`} className="rounded-xl border border-line-strong px-4 py-3">Báo cáo sự cố của đơn</Link>}
      {resultType === "longterm" && result.bookingId && <Link className="rounded-xl bg-primary px-4 py-3 text-white" href={`/rental-contract?rentalId=${encodeURIComponent(result.bookingId)}`}>Xem hợp đồng</Link>}
      {!resultIsSubscription && (invoiceId ? <Link className="rounded-xl bg-primary px-4 py-3 text-white" href={`/invoices/${invoiceId}`}>Xem hóa đơn</Link> : result.bookingId && <button type="button" onClick={prepareInvoice} disabled={loadingInvoice} className="rounded-xl border border-line-strong px-4 py-3 disabled:opacity-50">{loadingInvoice ? "Đang tra cứu hóa đơn..." : "Tra cứu hóa đơn"}</button>)}
      <Link href={resultIsSubscription ? "/my-subscriptions" : "/invoices"} className="rounded-xl border border-line-strong px-4 py-3">{resultIsSubscription ? "Gói của tôi" : "Danh sách hóa đơn"}</Link>
      <button type="button" className="rounded-xl border border-line-strong px-4 py-3" onClick={() => { setResult(null); setGeneralError(""); validation.reset(); }}>Tạo đơn khác</button>
    </div>
  </section>;

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Tạo đơn thuê xe</h1><p className="mt-2 text-sm text-ink-3">Chọn hình thức thuê, thời gian và phương tiện phù hợp.</p></div>
    <ValidatedForm validation={validation} validate={validate} onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="min-w-0 space-y-5 rounded-2xl border border-line bg-surface p-5 sm:p-6" aria-label="Thông tin đặt xe">
        <div>
          <label htmlFor="facilityId" className="text-sm font-semibold">Cơ sở nhận xe</label>
          <InlineSelect id="facilityId" name="facilityId" required value={facilityId} disabled={facilitiesQuery.isPending || facilitiesQuery.isFetching} className={inputClass} onChange={(event) => { setFacilityId(event.target.value); setDriverChoice(""); setVehicleId(""); validation.clear("hasDriver"); validation.clear("vehicleId"); }}>
            <option value="">{facilitiesQuery.isPending ? "Đang tải cơ sở..." : "Chọn cơ sở nhận xe"}</option>
            {(facilitiesQuery.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </InlineSelect>
          {facilitiesQuery.error && <p role="alert" className="mt-2 text-sm text-danger">Không thể tải cơ sở. <button type="button" onClick={() => void facilitiesQuery.refetch()} className="underline">Thử lại</button></p>}
          {!facilitiesQuery.isPending && !facilitiesQuery.error && !facilitiesQuery.data?.length && <p role="status" className="mt-2 text-sm text-ink-3">Chưa có cơ sở nhận xe. Vui lòng thử lại sau.</p>}
          {facility?.address && <p className="mt-2 text-sm text-ink-3">{facility.address}</p>}
        </div>
        <div><label htmlFor="rentalType" className="text-sm font-semibold">Hình thức thuê</label><InlineSelect id="rentalType" name="rentalType" className={inputClass} value={rentalType} onChange={(event) => { setRentalType(event.target.value); setDriverChoice(""); setVehicleId(""); validation.clear("hasDriver"); validation.clear("vehicleId"); if (event.target.value === "longterm") setPaymentMode("direct"); }}><option value="hourly">Thuê theo giờ</option><option value="longterm">Thuê dài hạn</option></InlineSelect></div>
        {facility && <div><label htmlFor="hasDriver" className="text-sm font-semibold">Hình thức lái</label><InlineSelect id="hasDriver" name="hasDriver" required className={inputClass} value={driverChoice} onChange={(event) => { setDriverChoice(event.target.value); if (driverChoice !== "") setVehicleId(""); validation.clear("vehicleId"); }}><option value="">Chọn hình thức lái</option><option value="false">Tự lái</option>{rentalType === "hourly" && <option value="true">Có tài xế</option>}</InlineSelect><p className="mt-2 text-sm text-ink-3">{rentalType === "longterm" ? "Thuê dài hạn hiện áp dụng hình thức tự lái." : driverChoice === "true" ? "Chỉ hiện xe khả dụng khi cơ sở có tài xế rảnh trong thời gian thuê." : "Chọn hình thức lái trước khi xem xe của cơ sở."}</p></div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="startTime" className="text-sm font-semibold">Ngày giờ nhận xe</label><InlineInput id="startTime" name="startTime" type="datetime-local" required className={inputClass} value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>
          <div><label htmlFor="endTime" className="text-sm font-semibold">Ngày giờ trả xe</label><InlineInput id="endTime" name="endTime" type="datetime-local" required className={inputClass} value={endTime} onChange={(event) => setEndTime(event.target.value)} /></div>
        </div>
        {canChooseVehicle ? <BookingVehicleCards vehicles={vehiclesQuery.data ?? []} value={vehicleId} onChange={setVehicleId} rentalType={rentalType} isPending={vehiclesQuery.isFetching && vehiclesQuery.isPending} isFetching={vehiclesQuery.isFetching} error={vehiclesQuery.error ? errorText(vehiclesQuery.error) : undefined} fieldError={validation.errors.vehicleId} emptyMessage={hasDriver ? "Chưa có xe và tài xế khả dụng tại cơ sở trong thời gian này. Vui lòng chọn thời gian hoặc cơ sở khác." : undefined} onRetry={() => void vehiclesQuery.refetch()} /> : <p role="status" className="rounded-xl border border-line bg-canvas p-4 text-sm text-ink-3">Chọn cơ sở nhận xe, sau đó chọn hình thức lái để xem xe khả dụng.</p>}
        {rentalType === "hourly" && <div><label htmlFor="paymentMode" className="text-sm font-semibold">Thanh toán</label><InlineSelect id="paymentMode" name="paymentMode" className={inputClass} value={paymentMode} onChange={(event) => { setPaymentMode(event.target.value); validation.clear("licenseStatus"); validation.clear("subscriptionId"); }}><option value="direct">Thanh toán trực tiếp</option><option value="subscription">Dùng gói thuê bao</option></InlineSelect></div>}
        {paymentMode === "direct" && <div><label htmlFor="paymentMethod" className="text-sm font-semibold">Phương thức thanh toán</label><InlineSelect id="paymentMethod" name="paymentMethod" required className={inputClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "payos" | "cash")}><option value="payos">Online qua PayOS</option><option value="cash">Tiền mặt tại cơ sở</option></InlineSelect><p className="mt-2 text-sm text-ink-3">Thanh toán sau khi nhân viên duyệt yêu cầu. Đơn thuê chính thức được cấp sau khi xác nhận đã nhận tiền.</p></div>}
        {paymentMode === "subscription" ? <div><label htmlFor="subscriptionId" className="text-sm font-semibold">Gói thuê bao</label><InlineSelect id="subscriptionId" name="subscriptionId" required className={inputClass} value={subscriptionId} onChange={(event) => setSubscriptionId(event.target.value)}><option value="">Chọn gói còn hiệu lực</option>{subscriptions.map((item) => <option key={item.id} value={item.id}>{item.planName} — còn {item.remainingHours} giờ</option>)}</InlineSelect>{subscriptionsQuery.error && <p role="alert" className="mt-2 text-sm text-danger">{errorText(subscriptionsQuery.error)}</p>}<Link href="/my-subscriptions" className="mt-2 inline-block text-sm text-primary underline">Quản lý gói của tôi</Link></div> : <div><label htmlFor="licenseStatus" className="text-sm font-semibold">Giấy phép lái xe</label><InlineInput id="licenseStatus" name="licenseStatus" readOnly className={inputClass} value={licenseQuery.isPending ? "Đang kiểm tra..." : licenseQuery.data?.status === "approved" ? "Đã được duyệt" : "Chưa được duyệt"} />{licenseQuery.error && <p role="alert" className="mt-2 text-sm text-danger">{errorText(licenseQuery.error)}</p>}<Link href="/driver-license" className="mt-2 inline-block text-sm text-primary underline">Cập nhật / kiểm tra GPLX</Link></div>}
      </section>
      <aside className="h-fit space-y-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold">Tóm tắt đặt xe</h2>
        {vehiclesQuery.isFetching ? <SkeletonBlock label="Đang tải thông tin xe đã chọn"><Skeleton className="h-40 w-full rounded-xl" /></SkeletonBlock> : vehicle && <VehicleImage src={vehicle.imageUrl} alt={vehicle.name} className="h-40 w-full rounded-xl" />}
        {facility && <p className="text-sm text-ink-3">Nhận xe: {facility.name}{driverChoice ? ` · ${hasDriver ? "Có tài xế" : "Tự lái"}` : ""}</p>}
        {vehicle && <BookingPickupMap facilityId={vehicle.facilityId} />}
        <p className="text-sm">{vehicle?.name ?? "Chưa chọn phương tiện"}</p><p className="text-sm text-ink-3">Thời gian: {hours.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giờ</p>
        {vehicle && <p className="text-sm">Đơn giá: {money(rentalType === "longterm" ? vehicle.monthlyPrice : vehicle.hourlyPrice)} / {rentalType === "longterm" ? "tháng" : "giờ"}</p>}
        {paymentMode === "subscription" ? <p className="text-sm">Sử dụng giờ trong gói thuê bao, không tạo hóa đơn thuê trực tiếp.</p> : <>
          {policy && <p className="text-sm">Chính sách: {policy.name ?? `#${policy.id}`}<br />VAT {policy.vatRate}% · Cọc {policy.depositPercentage}%</p>}
          {estimate && <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>Tiền thuê dự kiến</dt><dd>{money(estimate.rentalFee)}</dd></div><div className="flex justify-between"><dt>VAT</dt><dd>{money(estimate.vat)}</dd></div><div className="flex justify-between"><dt>Tiền cọc</dt><dd>{money(estimate.deposit)}</dd></div><div className="flex justify-between border-t border-line pt-3 font-bold"><dt>Tạm tính gồm cọc</dt><dd>{money(estimate.total)}</dd></div></dl>}
          <p className="text-xs text-ink-3">{rentalType === "longterm" ? "Tiền thuê dài hạn được máy chủ xác định theo khoảng thời gian và giá tháng." : "Bảng giá là dự toán. Số tiền chính thức được xác nhận trên đơn thuê và hóa đơn."}{hasDriver ? " Chi phí có tài xế được xác nhận bởi máy chủ." : ""}</p>
          {policyQuery.error && <p className="text-sm text-ink-3">Chưa tải được chính sách. Máy chủ sẽ áp dụng chính sách khi tạo đơn. <button type="button" className="underline" onClick={() => void policyQuery.refetch()}>Tải lại</button></p>}
        </>}
        {generalError && <p role="alert" className="text-sm text-danger">{generalError}</p>}
        <button type="submit" disabled={submitting || facilitiesQuery.isFetching || vehiclesQuery.isFetching || licenseQuery.isPending || vehiclesQuery.isError} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Đang gửi yêu cầu..." : "Xác nhận đặt xe"}</button>
        <Link href="/rental-contract" className="block text-center text-sm text-primary underline">Tra cứu hợp đồng thuê dài hạn</Link>
      </aside>
    </ValidatedForm>
  </div>;
}
