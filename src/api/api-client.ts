import { refreshSessionToken, handleAuthFailure } from "./token-refresh";

export interface ApiClientConfig {
  baseUrl?: string;
  customFetch?: typeof fetch;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  _isRetry?: boolean;
  skipAuthRefresh?: boolean;
}

export interface ApiEnvelope<T = unknown> {
  message?: string;
  is_success?: boolean;
  data?: T;
}

/** RFC 7807 ProblemDetails error structure with backend business code & traceId */
export class ApiProblemError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly title?: string;
  public readonly detail?: string;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;
  public readonly traceId?: string;
  public readonly retryable: boolean;
  public readonly data?: unknown;

  constructor(status: number, statusText: string, data?: unknown) {
    let unwrapped = data;
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as Record<string, unknown>).error === "object" &&
      (data as Record<string, unknown>).error !== null
    ) {
      const errorObj = asRecord((data as Record<string, unknown>).error);
      unwrapped = errorObj ? { ...(data as Record<string, unknown>), ...errorObj } : data;
    }
    const body = asRecord(unwrapped);
    const problem = asRecord(body?.error) ?? body;

    const parsedErrors: Record<string, string[]> = {};
    const errorList: string[] = [];

    const rawErrors = asRecord(problem?.errors);
    if (rawErrors) {
      for (const [key, err] of Object.entries(rawErrors)) {
        if (Array.isArray(err)) {
          parsedErrors[key] = err.map(String);
          for (const item of err) {
            if (item) errorList.push(key ? `${key}: ${item}` : String(item));
          }
        } else if (typeof err === "string" && err.trim()) {
          parsedErrors[key] = [err];
          errorList.push(key ? `${key}: ${err}` : err);
        }
      }
    }

    const title = typeof problem?.title === "string" ? problem.title : undefined;
    const detail =
      typeof problem?.detail === "string"
        ? problem.detail
        : typeof body?.message === "string"
          ? body.message
          : undefined;
    const code =
      typeof problem?.code === "string"
        ? problem.code
        : typeof body?.code === "string"
          ? body.code
          : undefined;
    const traceId =
      typeof problem?.traceId === "string"
        ? problem.traceId
        : typeof problem?.trace_id === "string"
          ? (problem.trace_id as string)
          : undefined;

    let message = `API Error [${status}]: ${statusText}`;
    if (errorList.length > 0) {
      message = errorList.join("\n");
    } else if (detail) {
      message = detail;
    } else if (title) {
      message = title;
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    super(message);
    this.name = "ApiProblemError";
    this.status = status;
    this.statusText = statusText;
    this.title = title;
    this.detail = detail;
    this.code = code;
    this.errors = Object.keys(parsedErrors).length > 0 ? parsedErrors : undefined;
    this.traceId = traceId;
    this.data = data;
    this.retryable = [408, 502, 503, 504].includes(status);
  }
}

/** Network transmission failure or abort */
export class ApiNetworkError extends Error {
  public readonly status = 0;
  public readonly retryable = true;

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ApiNetworkError";
  }
}

/** Backward compatibility alias */
export { ApiProblemError as ApiClientError };

let lastUnauthorizedAt = 0;
const UNAUTHORIZED_DEBOUNCE_MS = 3000;

export function emitUnauthorizedEvent(): void {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastUnauthorizedAt < UNAUTHORIZED_DEBOUNCE_MS) {
    return;
  }
  lastUnauthorizedAt = now;
  window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { timestamp: now } }));
}

export class ApiClient {
  private baseUrl: string;
  private fetchFn: typeof fetch;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  private static missingFetch: typeof fetch = () =>
    Promise.reject(new Error("fetch is not available"));

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || "").replace(/\/+$/, "");
    this.fetchFn =
      config.customFetch ??
      (typeof fetch !== "undefined" ? fetch.bind(globalThis) : ApiClient.missingFetch);
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout || 15000;
  }

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const cleanPath = path.replace(/^\/+/, "");
    const base = this.baseUrl ? `${this.baseUrl}/${cleanPath}` : `/${cleanPath}`;

    if (!params) return base;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }

    const query = searchParams.toString();
    return query ? `${base}?${query}` : base;
  }

  private serializeBody(body: BodyInit | null | undefined): BodyInit | null | undefined {
    if (
      body === undefined ||
      body === null ||
      typeof body === "string" ||
      (typeof FormData !== "undefined" && body instanceof FormData) ||
      (typeof Blob !== "undefined" && body instanceof Blob) ||
      (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) ||
      (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer)
    ) {
      return body;
    }
    return JSON.stringify(body);
  }

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      params,
      headers,
      body,
      _isRetry,
      skipAuthRefresh,
      credentials = "include",
      method = "GET",
      ...restOptions
    } = options;
    const url = this.buildUrl(path, params);
    const cleanPath = toCleanPath(path);
    const isGet = method.toUpperCase() === "GET";

    const mergedHeaders: HeadersInit = {
      ...this.defaultHeaders,
      ...headers,
    };
    const serializedBody = this.serializeBody(body);
    if (typeof FormData !== "undefined" && serializedBody instanceof FormData) {
      delete (mergedHeaders as Record<string, string>)["Content-Type"];
    }

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    let timedOut = false;
    const timeoutId = controller
      ? setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, this.timeout)
      : null;

    try {
      let response: Response;
      try {
        response = await this.fetchFn(url, {
          ...restOptions,
          method,
          body: serializedBody,
          headers: mergedHeaders,
          credentials,
          signal: controller ? controller.signal : undefined,
        });
      } catch (fetchErr) {
        if (timedOut) {
          throw new ApiProblemError(504, "Gateway Timeout", {
            title: "Yêu cầu quá thời gian chờ",
            detail: `Yêu cầu tới ${cleanPath} quá thời gian chờ (${this.timeout / 1000}s). Vui lòng thử lại.`,
            retryable: true,
          });
        }
        // Retry 1 lần chỉ cho GET khi gặp lỗi mạng
        if (isGet && !_isRetry) {
          return this.request<T>(path, { ...options, _isRetry: true });
        }
        throw new ApiNetworkError(
          fetchErr instanceof Error ? fetchErr.message : "Network error occurred",
          fetchErr,
        );
      }

      // 401 handling
      const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => cleanPath.startsWith(ep));
      const isProfileProbe = PROFILE_ENDPOINTS.some((ep) => cleanPath === ep);

      if (response.status === 401) {
        // Chỉ phát event nếu không phải probe và không phải login/refresh
        if (!isProfileProbe && !isAuthEndpoint) {
          emitUnauthorizedEvent();
        }

        if (!_isRetry && !skipAuthRefresh && !isAuthEndpoint) {
          const refreshed = await refreshSessionToken(this.fetchFn, this.baseUrl);
          if (refreshed) {
            return this.request<T>(path, {
              ...options,
              _isRetry: true,
            });
          }

          if (!isProfileProbe) {
            handleAuthFailure();
          }
          throw new ApiProblemError(401, "Unauthorized", {
            code: "UNAUTHORIZED",
            title: "Phiên đăng nhập đã hết hạn",
            detail: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
          });
        }
      }

      // Retry 1 lần cho GET khi gặp lỗi hạ tầng 502/503/504
      if (isGet && !_isRetry && [502, 503, 504].includes(response.status)) {
        return this.request<T>(path, { ...options, _isRetry: true });
      }

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new ApiProblemError(response.status, response.statusText, errorData);
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const json = await response.json();

      if (isApiEnvelope(json)) {
        if (!json.is_success) {
          throw new ApiProblemError(response.status, response.statusText, json);
        }
        return json.data as T;
      }

      return json as T;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  public get<T>(path: string, params?: RequestOptions["params"], options?: Omit<RequestOptions, "params">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET", params });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body as BodyInit | undefined,
    });
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body as BodyInit | undefined,
    });
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body as BodyInit | undefined,
    });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function toCleanPath(path: string): string {
  return path.split("?")[0].replace(/^\/+/, "");
}

/** Endpoints không kích hoạt auth refresh hay unauthorized event */
const AUTH_ENDPOINTS = ["auth/login", "auth/refresh", "auth/logout", "auth/google", "api/auth/login", "api/auth/refresh", "api/auth/logout"];

/** Probe endpoint kiểm tra phiên hiện tại - 401 khi chưa login là bình thường */
const PROFILE_ENDPOINTS = ["account/profile", "api/account/profile"];

export function isApiEnvelope(
  value: unknown,
): value is { message: string; is_success: boolean; data: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "is_success" in value &&
    "data" in value &&
    typeof (value as Record<string, unknown>).is_success === "boolean"
  );
}
