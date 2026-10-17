export interface FacilityCatalogItem {
  id: string;
  name: string;
  shortName: string;
  address: string;
  district: string;
  city: string;
  availableVehicles: number;
  openHours: string;
  phone: string;
  imageUrl: string;
}

export type VehicleCategory = "car" | "electric_car" | "motorbike" | "electric_motorbike";

export interface VehicleCatalogItem {
  id: string;
  name: string;
  category: VehicleCategory;
  categoryLabel: string;
  year: number;
  seats?: number;
  transmission: string;
  fuelType?: string;
  batteryCapacity?: string;
  maxRange?: string;
  storageCapacity?: string;
  hourlyPrice: number;
  monthlyPrice: number;
  facilityId: string;
  facilityName: string;
  imageUrl: string;
  badges: string[];
  isAvailable: boolean;
  supportsSubscription: boolean;
}

export interface SubscriptionPlanCatalogItem {
  id: string;
  name: string;
  hours: number;
  validityDays: number;
  price: number;
  popular?: boolean;
  features: string[];
}

export const MOCK_FACILITIES: FacilityCatalogItem[] = [
  {
    id: "fac-q1",
    name: "Chi nhánh Quận 1 — Trung tâm",
    shortName: "Chi nhánh Quận 1",
    address: "12 Trần Hưng Đạo, Phường Phạm Ngũ Lão, Quận 1",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    availableVehicles: 18,
    openHours: "06:00 – 23:00 hàng ngày",
    phone: "028 3822 xxxx",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fac-tsn",
    name: "Chi nhánh Sân bay Tân Sơn Nhất",
    shortName: "Sân bay Tân Sơn Nhất",
    address: "Cổng ga Quốc nội T1/T2, Phường 2, Quận Tân Bình",
    district: "Quận Tân Bình",
    city: "TP. Hồ Chí Minh",
    availableVehicles: 24,
    openHours: "24/7 (Phục vụ xuyên đêm)",
    phone: "028 3844 xxxx",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fac-tb",
    name: "Chi nhánh Tân Bình — Hoàng Hoa Thám",
    shortName: "Chi nhánh Tân Bình",
    address: "45 Hoàng Hoa Thám, Phường 13, Quận Tân Bình",
    district: "Quận Tân Bình",
    city: "TP. Hồ Chí Minh",
    availableVehicles: 14,
    openHours: "07:00 – 22:00 hàng ngày",
    phone: "028 3810 xxxx",
    imageUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fac-hn",
    name: "Chi nhánh Hà Nội — Long Biên",
    shortName: "Chi nhánh Hà Nội",
    address: "88 Nguyễn Văn Cừ, Phường Bồ Đề, Quận Long Biên",
    district: "Long Biên",
    city: "Hà Nội",
    availableVehicles: 16,
    openHours: "06:30 – 22:30 hàng ngày",
    phone: "024 3872 xxxx",
    imageUrl: "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=800&q=80",
  },
];

export const MOCK_VEHICLES: VehicleCatalogItem[] = [
  {
    id: "v-01",
    name: "Toyota Corolla Cross 1.8V",
    category: "car",
    categoryLabel: "Ô tô SUV 5 chỗ",
    year: 2024,
    seats: 5,
    transmission: "Tự động (CVT)",
    fuelType: "Xăng (6.5L/100km)",
    hourlyPrice: 120000,
    monthlyPrice: 18500000,
    facilityId: "fac-q1",
    facilityName: "Chi nhánh Quận 1",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    badges: ["Sở hữu trực tiếp", "Kiểm định 12 hạng mục", "Hỗ trợ gói thuê bao"],
    isAvailable: true,
    supportsSubscription: true,
  },
  {
    id: "v-02",
    name: "VinFast VF 8 Plus",
    category: "electric_car",
    categoryLabel: "Ô tô điện D-SUV",
    year: 2024,
    seats: 5,
    transmission: "Tự động",
    batteryCapacity: "87.7 kWh",
    maxRange: "471 km / lần sạc",
    hourlyPrice: 160000,
    monthlyPrice: 24000000,
    facilityId: "fac-tsn",
    facilityName: "Sân bay Tân Sơn Nhất",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    badges: ["Đội xe điện Thong Dong", "Miễn phí sạc hệ thống", "Giao nhận sân bay 24/7"],
    isAvailable: true,
    supportsSubscription: true,
  },
  {
    id: "v-03",
    name: "VinFast VF e34",
    category: "electric_car",
    categoryLabel: "Ô tô điện C-SUV",
    year: 2023,
    seats: 5,
    transmission: "Tự động",
    batteryCapacity: "42 kWh",
    maxRange: "318 km / lần sạc",
    hourlyPrice: 95000,
    monthlyPrice: 14500000,
    facilityId: "fac-tb",
    facilityName: "Chi nhánh Tân Bình",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    badges: ["Tiết kiệm chi phí", "Xe đô thị thông minh", "Kiểm định pin 100%"],
    isAvailable: true,
    supportsSubscription: true,
  },
  {
    id: "v-04",
    name: "Honda CR-V L 1.5 Turbo",
    category: "car",
    categoryLabel: "Ô tô Crossover 7 chỗ",
    year: 2024,
    seats: 7,
    transmission: "Tự động (CVT)",
    fuelType: "Xăng (7.2L/100km)",
    hourlyPrice: 150000,
    monthlyPrice: 22000000,
    facilityId: "fac-hn",
    facilityName: "Chi nhánh Hà Nội",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    badges: ["Phù hợp gia đình & đường dài", "Honda SENSING an toàn", "Bảo dưỡng chính hãng"],
    isAvailable: true,
    supportsSubscription: false,
  },
  {
    id: "v-05",
    name: "Honda SH 160i ABS",
    category: "motorbike",
    categoryLabel: "Xe tay ga cao cấp",
    year: 2024,
    transmission: "Tự động",
    fuelType: "Xăng (2.3L/100km)",
    storageCapacity: "28 lít",
    hourlyPrice: 35000,
    monthlyPrice: 3800000,
    facilityId: "fac-q1",
    facilityName: "Chi nhánh Quận 1",
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    badges: ["Xe ga đô thị", "Phanh ABS 2 kênh", "Kèm 2 mũ bảo hiểm đạt chuẩn"],
    isAvailable: true,
    supportsSubscription: true,
  },
  {
    id: "v-06",
    name: "VinFast Feliz S",
    category: "electric_motorbike",
    categoryLabel: "Xe máy điện thông minh",
    year: 2024,
    transmission: "Tự động",
    batteryCapacity: "Pin LFP 3.5 kWh",
    maxRange: "198 km / lần sạc",
    hourlyPrice: 25000,
    monthlyPrice: 2400000,
    facilityId: "fac-tsn",
    facilityName: "Sân bay Tân Sơn Nhất",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    badges: ["Di chuyển xanh", "Miễn phí sạc chi nhánh", "Cốp rộng 25L"],
    isAvailable: true,
    supportsSubscription: true,
  },
  {
    id: "porsche-carrera-4s",
    name: "Porsche 911 Carrera 4S",
    category: "car",
    categoryLabel: "Xe Thể Thao Đương Đại",
    year: 2026,
    seats: 4,
    transmission: "Tự động PDK 8 cấp",
    fuelType: "Xăng cao cấp",
    hourlyPrice: 450000,
    monthlyPrice: 65000000,
    facilityId: "fac-q1",
    facilityName: "Chi nhánh Quận 1 — Trung tâm",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    badges: ["MODERN PERFORMANCE", "Động cơ Twin-Turbo", "Kiểm định 12 hạng mục"],
    isAvailable: true,
    supportsSubscription: true,
  },
];

export const MOCK_SUBSCRIPTION_PLANS: SubscriptionPlanCatalogItem[] = [
  {
    id: "sub-20h",
    name: "Gói Trải Nghiệm",
    hours: 20,
    validityDays: 30,
    price: 1500000,
    features: [
      "20 giờ di chuyển linh hoạt",
      "Hạn dùng 30 ngày kể từ ngày kích hoạt",
      "Áp dụng cho mọi xe ô tô & xe máy tiêu chuẩn",
      "Theo dõi số giờ còn lại trực tiếp trên ứng dụng",
      "Miễn cọc bảo lưu đơn thuê",
    ],
  },
  {
    id: "sub-50h",
    name: "Gói Đô Thị Tiêu Chuẩn",
    hours: 50,
    validityDays: 60,
    price: 3450000,
    popular: true,
    features: [
      "50 giờ di chuyển tự do",
      "Hạn dùng 60 ngày",
      "Tiết kiệm 25% so với thuê trực tiếp từng giờ",
      "Ưu tiên giữ xe tại mọi chi nhánh",
      "Hỗ trợ giao nhận xe miễn phí bán kính 5km",
      "Hỗ trợ đổi dòng xe linh hoạt khi cần",
    ],
  },
  {
    id: "sub-100h",
    name: "Gói Doanh Nghiệp & Đường Dài",
    hours: 100,
    validityDays: 90,
    price: 6200000,
    features: [
      "100 giờ thuê xe cao cấp",
      "Hạn dùng 90 ngày",
      "Bao gồm cả xe điện cao cấp VF 8 và SUV 7 chỗ",
      "Ưu tiên điều phối tài xế chuyên nghiệp",
      "Xuất hoá đơn VAT tự động cho doanh nghiệp",
      "Đường dây hỗ trợ kỹ thuật viên 24/7",
    ],
  },
];
