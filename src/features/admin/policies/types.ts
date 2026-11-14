import { z } from "zod";

export interface RentalPolicy {
  id: number;
  vehicleTypeId: number | null;
  vehicleTypeName?: string;
  name: string;
  vatRate: number;
  overtimeFeeRate: number;
  depositPercentage: number;
  isActive: boolean;
  rentalCount?: number;
  managedBy?: string;
  createdAt?: string;
}

export interface PolicyInput {
  vehicleTypeId: number;
  name: string;
  vatRate: number;
  overtimeFeeRate: number;
  depositPercentage: number;
  isActive: boolean;
}

export const policySchema = z.object({
  vehicleTypeId: z
    .number({ message: "Vui lòng chọn loại xe áp dụng" })
    .min(1, "Vui lòng chọn loại xe áp dụng"),
  name: z
    .string()
    .trim()
    .min(3, "Tên phiên bản phải từ 3 đến 120 ký tự")
    .max(120, "Tên phiên bản không được vượt quá 120 ký tự"),
  vatRate: z
    .number({ message: "Thuế VAT phải là số" })
    .min(0, "Thuế VAT không được nhỏ hơn 0%")
    .max(100, "Thuế VAT không được vượt quá 100%")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Thuế VAT tối đa 2 chữ số thập phân",
    }),
  overtimeFeeRate: z
    .number({ message: "Phí trả trễ phải là số" })
    .min(0, "Phí trả trễ không được nhỏ hơn 0%")
    .max(100, "Phí trả trễ không được vượt quá 100%")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Phí trả trễ tối đa 2 chữ số thập phân",
    }),
  depositPercentage: z
    .number({ message: "Đặt cọc phải là số" })
    .min(0, "Tỷ lệ cọc không được nhỏ hơn 0%")
    .max(100, "Tỷ lệ cọc không được vượt quá 100%")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "Tỷ lệ cọc tối đa 2 chữ số thập phân",
    }),
  isActive: z.boolean().default(true),
});

export type PolicyFormValues = z.infer<typeof policySchema>;

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  includedHours: number;
  isActive: boolean;
  subscribersCount?: number;
}

export const planSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Tên gói phải từ 3 đến 80 ký tự")
    .max(80, "Tên gói không được vượt quá 80 ký tự"),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
  price: z
    .number({ message: "Giá gói phải là số" })
    .int("Giá gói phải là số nguyên")
    .min(0, "Giá gói không được nhỏ hơn 0đ")
    .max(1_000_000_000, "Giá gói tối đa 1.000.000.000đ"),
  durationDays: z
    .number({ message: "Thời hạn phải là số" })
    .int("Thời hạn phải là số nguyên ngày")
    .min(1, "Thời hạn tối thiểu là 1 ngày")
    .max(365, "Thời hạn tối đa là 365 ngày"),
  includedHours: z
    .number({ message: "Số giờ kèm theo phải là số" })
    .int("Số giờ kèm theo phải là số nguyên")
    .min(1, "Số giờ kèm theo tối thiểu là 1 giờ")
    .max(2000, "Số giờ kèm theo tối đa là 2.000 giờ"),
  isActive: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planSchema>;
export type PlanInput = PlanFormValues;

export interface VehicleTypeOption {
  id: number;
  name: string;
}
