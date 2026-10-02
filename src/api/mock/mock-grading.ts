export interface InspectionCheckItem {
  name: string;
  standard: string;
  status: "pass" | "warning" | "fail";
}

export interface InspectionRecordItem {
  recordNumber: string;
  rentalId: string;
  vehicleName: string;
  licensePlate: string;
  plateNumber: string;
  type: string;
  inspectionType: "pre_rental" | "post_rental";
  inspectedAt: string;
  inspectorName: string;
  inspectorCode: string;
  odometer: string;
  batteryOrFuelLevel: string;
  fuelBatteryLevel: string;
  digitalSealHash: string;
  checkItems: InspectionCheckItem[];
  gradingScore?: number;
  grade?: "A+" | "A" | "B" | "C";
}

export const MOCK_INSPECTION_RECORD: InspectionRecordItem = {
  recordNumber: "KD-2026-08819",
  rentalId: "VRS-2026-H892",
  vehicleName: "Toyota Corolla Cross 1.8V (2024)",
  licensePlate: "51K-892.44",
  plateNumber: "51K-892.44",
  type: "Kiểm định trước khi bàn giao",
  inspectionType: "pre_rental",
  inspectedAt: "08:15 — 02/10/2026",
  inspectorName: "Nguyễn Văn Nam",
  inspectorCode: "KT-042",
  odometer: "14.820 km",
  batteryOrFuelLevel: "8/8 (Đầy bình xăng)",
  fuelBatteryLevel: "8/8",
  digitalSealHash: "SHA256: 4f8a9e...b201a",
  grade: "A+",
  gradingScore: 98,
  checkItems: [
    { name: "Áp suất & độ mòn lốp xe (4 bánh + sơ cua)", standard: "2.3 bar / Gai lốp > 4mm", status: "pass" },
    { name: "Hệ thống phanh ABS & dầu trợ lực lái", standard: "Đạt chuẩn an toàn cấp 1", status: "pass" },
    { name: "Dung tích nhiên liệu / Mức sạc pin thực tế", standard: "Chốt kim đo thực tế lúc giao", status: "pass" },
    { name: "Ngoại thất, sơn thân vỏ & hệ thống chiếu sáng", standard: "Chụp 8 góc ảnh số hoá", status: "pass" },
    { name: "Nội thất, vệ sinh khoang lái & khử khuẩn ozone", standard: "Đạt tiêu chuẩn xuất trạm", status: "pass" },
    { name: "Giấy tờ đăng kiểm, bảo hiểm TNDS & vật chất", standard: "Bản gốc đầy đủ trong cốp", status: "pass" },
  ],
};

export const MOCK_GRADING_STANDARDS = [
  { code: "STD-01", name: "An toàn vận hành & Khung gầm", minScore: 95 },
  { code: "STD-02", name: "Động cơ / Pin & Hệ thống dẫn động", minScore: 90 },
  { code: "STD-03", name: "Khoang lái, Vệ sinh & Khử khuẩn", minScore: 95 },
  { code: "STD-04", name: "Hồ sơ pháp lý, Đăng kiểm & Bảo hiểm", minScore: 100 },
];
