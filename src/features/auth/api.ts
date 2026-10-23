import { defaultApiClient } from "@/api/default-api-client";
import { ApiClientError } from "@/api/api-client";
import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  StartRegistrationData,
  VerifyRegistrationData,
} from "./types";

/**
 * Đăng nhập người dùng qua API backend.
 * Quản lý phiên 100% trong bộ nhớ (In-Memory) — KHÔNG lưu bất kỳ thông tin cá nhân (PII) nào vào localStorage.
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await defaultApiClient.post<LoginResponse | undefined>(
    "auth/login",
    {
      email: credentials.email.trim(),
      password: credentials.password,
      rememberMe: credentials.rememberMe ?? false,
    },
  );

  let user: AuthUser;

  // Nếu phản hồi backend có sẵn đối tượng người dùng
  if (response && response.email && response.fullName) {
    user = {
      email: response.email,
      fullName: response.fullName,
      gender: response.gender,
      phone: response.phone,
      avatarUrl: response.avatarUrl,
      roles: response.roles || ["Customer"],
    };
  } else {
    // Hành vi tiêu chuẩn của Backend (trả về 204 No Content kèm Set-Cookie HttpOnly)
    // Lấy thông tin hồ sơ người dùng từ cookie phiên hiện tại
    const profile = await getProfile();
    if (!profile) {
      throw new Error("Không thể tải thông tin hồ sơ người dùng sau khi đăng nhập.");
    }
    user = profile;
  }

  return user;
}

/**
 * Lấy thông tin hồ sơ người dùng hiện tại từ endpoint account/profile.
 * - HTTP 200: trả về AuthUser
 * - HTTP 401: coi là khách vãng lai (unauthenticated/anonymous), trả về null
 * - Lỗi khác (mạng/timeout): ném lỗi để TanStack Query xử lý
 */
export async function getProfile(): Promise<AuthUser | null> {
  try {
    const profile = await defaultApiClient.get<AuthUser>("account/profile");
    return profile;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * Đăng xuất tài khoản khỏi hệ thống:
 * Gửi yêu cầu huỷ cookie phiên tới backend.
 */
export async function logoutUser(): Promise<void> {
  try {
    await defaultApiClient.post("auth/logout");
  } catch (err) {
    console.warn("[Auth API] Logout API warning:", err);
  }
}

export async function startRegistration(data: StartRegistrationData): Promise<void> {
  await defaultApiClient.post("account/registrations", {
    email: data.email.trim(),
    fullName: data.fullName.trim(),
    password: data.password,
  });
}

export async function verifyRegistration(data: VerifyRegistrationData): Promise<void> {
  await defaultApiClient.post("account/registrations/verify", {
    email: data.email.trim(),
    otp: data.otp.trim(),
  });
}

export async function resendRegistrationOtp(email: string): Promise<void> {
  await defaultApiClient.post("account/registrations/resend", {
    email: email.trim(),
  });
}

export async function startPasswordReset(email: string): Promise<void> {
  await defaultApiClient.post("account/password-resets", {
    email: email.trim(),
  });
}

export async function verifyPasswordReset(data: { email: string; otp: string; newPassword: string }): Promise<void> {
  await defaultApiClient.post("account/password-resets/verify", {
    email: data.email.trim(),
    otp: data.otp.trim(),
    newPassword: data.newPassword,
  });
}
