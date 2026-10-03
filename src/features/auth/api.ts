import { defaultApiClient } from "@/api/default-api-client";
import { AuthUser, LoginCredentials, LoginResponse } from "./types";

const LOCAL_STORAGE_USER_KEY = "thongdong_auth_user";

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
    // Fetch user profile using session cookie
    const profile = await getProfile();
    if (!profile) {
      throw new Error("Không thể tải thông tin hồ sơ người dùng.");
    }
    user = profile;
  }

  // Cache user info in localStorage for seamless client-side state
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
  }

  return user;
}

export async function getProfile(): Promise<AuthUser | null> {
  try {
    const profile = await defaultApiClient.get<AuthUser>("account/profile");
    if (typeof window !== "undefined" && profile) {
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      } catch {
        // Ignore
      }
    }
    return profile;
  } catch {
    // If not authenticated or profile fails, clear cached user
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      } catch {
        // Ignore
      }
    }
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await defaultApiClient.post("auth/logout");
  } catch (err) {
    console.warn("[Auth API] Logout API warning:", err);
  } finally {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      } catch {
        // Ignore
      }
    }
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
