import { Role } from "@/features/auth/roles";

export interface AdminUserListItem {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: Role[];
  isActive: boolean;
  hasStaffProfile: boolean;
  hasCustomerProfile: boolean;
  createdAt: string;
}

export interface AdminUserCustomerProfile {
  id: number;
  licenseStatus?: "pending" | "approved" | "rejected";
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  licenseImgUrl?: string;
  loyaltyPoint?: number;
}

export interface AdminUserStaffProfile {
  id: number;
  department?: string;
  facility?: string;
  isDriver: boolean;
  licenseExpiry?: string;
  rating?: number;
}

export interface AdminUserLockInfo {
  reason?: string;
  by?: string;
  at?: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  gender?: string;
  emailVerified?: boolean;
  lastLoginAt?: string;
  customer?: AdminUserCustomerProfile | null;
  staff?: AdminUserStaffProfile | null;
  lockInfo?: AdminUserLockInfo | null;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  isActive?: string; // "all" | "active" | "locked"
  profile?: string;  // "all" | "customer" | "staff" | "none"
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "fullName" | "email";
  sortOrder?: "asc" | "desc";
}

export interface UserPageResult {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}
