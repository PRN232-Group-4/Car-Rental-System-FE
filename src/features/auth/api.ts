import { defaultApiClient } from "@/api/default-api-client";
import { ApiClientError } from "@/api/api-client";
import { AUTH_USER_STORAGE_KEY } from "@/api/token-refresh";
import {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  StartRegistrationData,
  VerifyRegistrationData,
} from "./types";

const LOCAL_STORAGE_USER_KEY = AUTH_USER_STORAGE_KEY;

function cacheUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore localStorage errors (e.g. private mode)
  }
}

function clearCachedUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  } catch {
    // Ignore
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await defaultApiClient.post<LoginResponse | undefined>(
    "auth/login",
    {
      email: credentials.email.trim(),
      password: credentials.password,
      rememberMe: credentials.rememberMe ?? false,
    }
  );

  let user: AuthUser;

  // If response contains user object (mock mode or extended BE)
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
    // Backend standard behavior (returns 204 No Content with Set-Cookie)
    // Fetch user profile using session cookie. Xoá cache cũ trước để nếu bước này
    // lỗi thì không "đăng nhập" nhầm bằng hồ sơ của tài khoản trước đó.
    clearCachedUser();
    const profile = await getProfile();
    if (!profile) {
      throw new Error("Không thể tải thông tin hồ sơ người dùng.");
    }
    user = profile;
  }

  // Cache user info in localStorage for seamless client-side state
  cacheUser(user);

  return user;
}

export async function getProfile(): Promise<AuthUser | null> {
  try {
    const profile = await defaultApiClient.get<AuthUser>("account/profile");
    if (profile) cacheUser(profile);
    return profile;
  } catch (error) {
    // 401 = phiên thực sự chết → xoá cache.
    // Lỗi mạng/offline → giữ cache để người dùng không bị đăng xuất oan.
    if (error instanceof ApiClientError && error.status === 401) {
      clearCachedUser();
      return null;
    }
    return getCachedUser();
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await defaultApiClient.post("auth/logout");
  } catch (err) {
    console.warn("[Auth API] Logout API warning:", err);
  } finally {
    clearCachedUser();
  }
}

export function getCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
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
