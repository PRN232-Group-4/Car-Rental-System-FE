export type UserRole = "Customer" | "Staff" | "Admin" | "Driver" | "Maintenance";

export interface AuthUser {
  email: string;
  fullName: string;
  gender?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  roles: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  email?: string;
  fullName?: string;
  gender?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  roles?: string[];
  message?: string;
}

export interface StartRegistrationData {
  email: string;
  fullName: string;
  password: string;
}

export interface VerifyRegistrationData {
  email: string;
  otp: string;
}

