"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type ProfileDetails = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
};

export default function ProfileManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [details, setDetails] = useState<ProfileDetails>({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const updateDetails = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setDetails((current) => ({ ...current, [name]: value }));
    setProfileSaved(false);
  };

  const selectFile = (file?: File) => {
    setFileError("");
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setFileError("Vui lòng chọn ảnh JPG, PNG, WEBP hoặc tệp PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFileError("Tệp vượt quá 10 MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }

    setSelectedFile(file);
    setIsPending(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setFileError("Vui lòng tải lên giấy phép lái xe trước khi gửi duyệt.");
      return;
    }
    setIsPending(true);
  };

  const handleSaveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaved(true);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setIsPending(false);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8f6] text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="ambient-glow-orb orb-drift -right-48 -top-52 h-[600px] w-[600px] bg-emerald-300/45" />
        <div className="ambient-glow-orb orb-drift-reverse -left-56 top-[420px] h-[540px] w-[540px] bg-cyan-200/50" />
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: "radial-gradient(#059669 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }} />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:pt-36">
        <div className="mb-7 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition-colors hover:text-emerald-700">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-700">Hồ sơ của tôi</span>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Tài khoản cá nhân</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Quản lý hồ sơ</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Cập nhật thông tin và xác minh giấy phép lái xe để sẵn sàng cho chuyến đi tiếp theo.
            </p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
            isPending
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-white/80 text-slate-600"
          }`}>
            {isPending ? <Clock3 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {isPending ? "Chờ phê duyệt" : "Chưa xác minh"}
          </div>
        </div>

        <section aria-label="Tiến trình xác minh hồ sơ" className="glass-card mb-8 rounded-3xl p-5 sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Trạng thái hồ sơ tài xế</h2>
              <p className="mt-1 text-sm text-slate-500">Hoàn tất các bước dưới đây để xác minh tài khoản.</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
              isPending ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
            }`}>
              {isPending ? "PENDING APPROVAL" : "CHƯA HOÀN TẤT"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ProgressStep
              number="01"
              title="Thông tin cá nhân"
              description={profileSaved ? "Đã lưu thông tin" : "Cập nhật thông tin cơ bản"}
              complete={profileSaved}
            />
            <ProgressStep
              number="02"
              title="Giấy phép lái xe"
              description={isPending ? "Đã gửi tài liệu" : "Tải lên ảnh hoặc PDF"}
              complete={isPending}
            />
            <ProgressStep
              number="03"
              title="Phê duyệt"
              description={isPending ? "Đang được đội ngũ kiểm tra" : "Chờ gửi hồ sơ"}
              complete={false}
              active={isPending}
            />
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-card rounded-3xl p-5 sm:p-7">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-slate-500">Thông tin liên hệ và nhận diện tài khoản.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <FormField label="Họ và tên" htmlFor="fullName" icon={<UserRound className="h-4 w-4" />}>
                <input
                  id="fullName"
                  name="fullName"
                  value={details.fullName}
                  onChange={updateDetails}
                  autoComplete="name"
                  placeholder="Nhập họ và tên"
                  className="w-full rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  required
                />
              </FormField>
              <FormField label="Email" htmlFor="email" icon={<Mail className="h-4 w-4" />}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={details.email}
                  onChange={updateDetails}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  required
                />
              </FormField>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Số điện thoại" htmlFor="phone" icon={<Phone className="h-4 w-4" />}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={details.phone}
                    onChange={updateDetails}
                    autoComplete="tel"
                    placeholder="090 123 4567"
                    className="w-full rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />
                </FormField>
                <FormField label="Ngày sinh" htmlFor="dateOfBirth" icon={<CalendarDays className="h-4 w-4" />}>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={details.dateOfBirth}
                    onChange={updateDetails}
                    autoComplete="bday"
                    className="w-full rounded-xl border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    required
                  />
                </FormField>
              </div>
              <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-200/70 pt-5 sm:flex-row sm:items-center">
                <p aria-live="polite" className="text-sm text-emerald-700">
                  {profileSaved ? "Thông tin đã được lưu." : ""}
                </p>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  Lưu thông tin
                </button>
              </div>
            </form>
          </section>

          <div className="space-y-6">
            <section className="glass-card rounded-3xl p-5 sm:p-7">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Giấy phép lái xe</h2>
                  <p className="mt-1 text-sm text-slate-500">Tải lên giấy phép hợp lệ để xác minh danh tính.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="license-file"
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-7 text-center transition ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id="license-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                    <Upload className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedFile ? "Chọn tệp khác" : "Nhấn để tải lên hoặc kéo thả tệp"}
                  </span>
                  <span className="mt-2 text-xs text-slate-500">JPG, PNG, WEBP hoặc PDF · Tối đa 10 MB</span>
                </label>

                {selectedFile && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      aria-label="Xóa tệp đã chọn"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {fileError}
                  </p>
                )}

                {isPending && (
                  <div role="status" className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">Hồ sơ đang chờ phê duyệt</p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        Chúng tôi sẽ thông báo khi giấy phép của bạn được kiểm tra xong.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!selectedFile || isPending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isPending ? <Check className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  {isPending ? "Đã gửi xét duyệt" : "Gửi giấy phép để xét duyệt"}
                </button>
              </form>
            </section>

            <aside className="rounded-2xl border border-sky-200/80 bg-sky-50/80 p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                <div>
                  <h3 className="text-sm font-bold text-sky-950">Tài liệu an toàn và rõ nét</h3>
                  <p className="mt-1 text-sm leading-6 text-sky-900/80">
                    Đảm bảo ảnh hiển thị đầy đủ thông tin, không bị lóa hoặc cắt mất góc. Chỉ sử dụng giấy phép còn hiệu lực.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProgressStep({
  number,
  title,
  description,
  complete,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  complete: boolean;
  active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${
      complete
        ? "border-emerald-200 bg-emerald-50/70"
        : active
          ? "border-amber-200 bg-amber-50/70"
          : "border-slate-200/80 bg-white/50"
    }`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
        complete
          ? "bg-emerald-600 text-white"
          : active
            ? "bg-amber-500 text-white"
            : "bg-slate-100 text-slate-500"
      }`}>
        {complete ? <Check className="h-5 w-5" /> : number}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
      </span>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
