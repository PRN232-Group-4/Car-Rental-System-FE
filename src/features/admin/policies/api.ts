import { apiClient, ApiProblemError } from "@/api";
import type {
  RentalPolicy,
  PolicyInput,
  SubscriptionPlan,
  PlanInput,
  VehicleTypeOption,
} from "./types";

// Mock store ban đầu
const MOCK_VEHICLE_TYPES: VehicleTypeOption[] = [
  { id: 1, name: "Ô tô xăng" },
  { id: 2, name: "Xe máy xăng" },
  { id: 3, name: "Ô tô điện" },
  { id: 4, name: "Xe máy điện" },
];

let mockPolicies: RentalPolicy[] = [
  {
    id: 1,
    vehicleTypeId: 1,
    vehicleTypeName: "Ô tô xăng",
    name: "Chính sách tiêu chuẩn Ô tô 2026-Q1",
    vatRate: 10,
    overtimeFeeRate: 15,
    depositPercentage: 10,
    isActive: true,
    managedBy: "Admin Quản trị",
    createdAt: "2026-01-15T08:00:00Z",
  },
  {
    id: 2,
    vehicleTypeId: 2,
    vehicleTypeName: "Xe máy xăng",
    name: "Chính sách tiêu chuẩn Xe máy 2026",
    vatRate: 8,
    overtimeFeeRate: 10,
    depositPercentage: 5,
    isActive: true,
    managedBy: "Admin Quản trị",
    createdAt: "2026-01-10T09:30:00Z",
  },
  {
    id: 3,
    vehicleTypeId: 3,
    vehicleTypeName: "Ô tô điện",
    name: "Chính sách kích cầu Xe điện Xanh",
    vatRate: 10,
    overtimeFeeRate: 12,
    depositPercentage: 8,
    isActive: true,
    managedBy: "Manager Vận hành",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: 4,
    vehicleTypeId: 1,
    vehicleTypeName: "Ô tô xăng",
    name: "Chính sách thí điểm Ô tô du lịch",
    vatRate: 10,
    overtimeFeeRate: 20,
    depositPercentage: 12,
    isActive: true, // Trùng active với id: 1 để tạo conflict test banner
    managedBy: "Manager Vận hành",
    createdAt: "2026-03-01T14:00:00Z",
  },
];

let mockPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Gói Trải Nghiệm Khởi Đầu",
    description: "Dành cho khách hàng mới muốn dùng thử xe trong các chuyến đi ngắn hoặc cuối tuần.",
    price: 990000,
    durationDays: 30,
    includedHours: 12,
    isActive: true,
    subscribersCount: 24, // Đã có người mua
  },
  {
    id: 2,
    name: "Gói Đô Thị Thông Minh",
    description: "Tối ưu cho người đi làm hàng ngày trong nội thành, ưu tiên giữ xe giờ cao điểm.",
    price: 2490000,
    durationDays: 60,
    includedHours: 35,
    isActive: true,
    subscribersCount: 88, // Đã có người mua
  },
  {
    id: 3,
    name: "Gói Doanh Nhân & Gia Đình",
    description: "Hạn mức giờ linh hoạt tối đa cho chuyến công tác và du lịch dài ngày không gián đoạn.",
    price: 4990000,
    durationDays: 90,
    includedHours: 80,
    isActive: true,
    subscribersCount: 15,
  },
  {
    id: 4,
    name: "Gói Thử Nghiệm Nội Bộ",
    description: "Gói thử nghiệm hệ thống mới, chưa mở bán ra công chúng.",
    price: 500000,
    durationDays: 14,
    includedHours: 6,
    isActive: false,
    subscribersCount: 0, // Chưa ai mua -> được xóa
  },
];

let nextPolicyId = 100;
let nextPlanId = 100;

export async function fetchVehicleTypes(): Promise<VehicleTypeOption[]> {
  try {
    const res = await apiClient.get<VehicleTypeOption[]>("/api/vehicle-types");
    if (Array.isArray(res) && res.length > 0) return res;
  } catch {
    // fallback mock
  }
  return MOCK_VEHICLE_TYPES;
}

export async function fetchRentalPolicies(): Promise<RentalPolicy[]> {
  try {
    const res = await apiClient.get<RentalPolicy[]>("/api/rental-policies");
    if (Array.isArray(res)) return res;
  } catch {
    // fallback mock
  }
  return [...mockPolicies];
}

export async function createRentalPolicy(input: PolicyInput): Promise<RentalPolicy> {
  try {
    return await apiClient.post<RentalPolicy>("/api/rental-policies", input);
  } catch (err) {
    if (err instanceof ApiProblemError) throw err;
    // Mock fallback
    const vt = MOCK_VEHICLE_TYPES.find((v) => v.id === input.vehicleTypeId);
    const newPolicy: RentalPolicy = {
      id: ++nextPolicyId,
      vehicleTypeId: input.vehicleTypeId,
      vehicleTypeName: vt?.name ?? "Loại xe khác",
      name: input.name,
      vatRate: input.vatRate,
      overtimeFeeRate: input.overtimeFeeRate,
      depositPercentage: input.depositPercentage,
      isActive: input.isActive,
      managedBy: "Admin Hiện tại",
      createdAt: new Date().toISOString(),
    };
    mockPolicies = [newPolicy, ...mockPolicies];
    return newPolicy;
  }
}

export async function fetchSubscriptionPlans(includeAll = true): Promise<SubscriptionPlan[]> {
  try {
    const query = includeAll ? "?all=true" : "";
    const res = await apiClient.get<SubscriptionPlan[]>(`/api/subscription-plans${query}`);
    if (Array.isArray(res)) return res;
  } catch {
    // fallback mock
  }
  return includeAll ? [...mockPlans] : mockPlans.filter((p) => p.isActive);
}

export async function createSubscriptionPlan(input: PlanInput): Promise<SubscriptionPlan> {
  try {
    return await apiClient.post<SubscriptionPlan>("/api/subscription-plans", input);
  } catch (err) {
    if (err instanceof ApiProblemError) throw err;
    const newPlan: SubscriptionPlan = {
      id: ++nextPlanId,
      ...input,
      subscribersCount: 0,
    };
    mockPlans = [newPlan, ...mockPlans];
    return newPlan;
  }
}

export async function updateSubscriptionPlan(
  id: number,
  input: PlanInput
): Promise<SubscriptionPlan> {
  try {
    return await apiClient.put<SubscriptionPlan>(`/api/subscription-plans/${id}`, input);
  } catch (err) {
    if (err instanceof ApiProblemError) throw err;
    const idx = mockPlans.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new ApiProblemError(404, "Not Found", {
        type: "https://httpstatuses.com/404",
        title: "Not Found",
        detail: `Không tìm thấy gói thuê bao #${id}`,
      });
    }
    const updated: SubscriptionPlan = {
      ...mockPlans[idx]!,
      ...input,
    };
    mockPlans[idx] = updated;
    return updated;
  }
}

export async function deleteSubscriptionPlan(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/subscription-plans/${id}`);
  } catch (err) {
    if (err instanceof ApiProblemError) throw err;
    const target = mockPlans.find((p) => p.id === id);
    if (!target) {
      throw new ApiProblemError(404, "Not Found", {
        type: "https://httpstatuses.com/404",
        title: "Not Found",
        detail: `Không tìm thấy gói thuê bao #${id}`,
      });
    }
    // Ràng buộc nghiệp vụ: gói đã có người mua không được xóa cứng
    if (target.subscribersCount && target.subscribersCount > 0) {
      throw new ApiProblemError(409, "Conflict", {
        type: "https://httpstatuses.com/409",
        title: "Conflict",
        detail: `Gói "${target.name}" đã có ${target.subscribersCount} khách hàng đăng ký sử dụng. Không thể xóa dữ liệu lịch sử; vui lòng chọn Ngừng bán thay vì xóa.`,
      });
    }
    mockPlans = mockPlans.filter((p) => p.id !== id);
  }
}
