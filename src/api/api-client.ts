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

export class ApiClientError extends Error {
  public status: number;
  public statusText: string;
  public data: unknown;

  constructor(status: number, statusText: string, data: unknown) {
    // The deployed API wraps ProblemDetails inside the six-field envelope.
    if (typeof data === "object" && data !== null && "error" in data &&
        typeof data.error === "object" && data.error !== null) {
      data = { ...(data as Record<string, unknown>), ...data.error };
    }
    let message = `API Error [${status}]: ${statusText}`;

    if (typeof data === "object" && data !== null) {
      const d = data as Record<string, unknown>;
      const errorList: string[] = [];
      if (d.errors && typeof d.errors === "object") {
        for (const [key, err] of Object.entries(d.errors as Record<string, unknown>)) {
          if (Array.isArray(err)) {
            for (const item of err) {
              if (item) {
                errorList.push(key ? `${key}: ${item}` : String(item));
              }
            }
          } else if (typeof err === "string" && err.trim()) {
            errorList.push(key ? `${key}: ${err}` : err);
          }
        }
      }

      if (errorList.length > 0) {
        message = errorList.join("\n");
      } else if (typeof d.detail === "string" && d.detail) {
        message = d.detail;
      } else if (typeof d.message === "string" && d.message) {
        message = d.message;
      } else if (typeof d.title === "string" && d.title) {
        message = d.title;
      }
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
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
    const { params, headers, body, _isRetry, skipAuthRefresh, credentials = "include", ...restOptions } = options;
    const url = this.buildUrl(path, params);

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
      const response = await this.fetchFn(url, {
        ...restOptions,
        body: serializedBody,
        headers: mergedHeaders,
        credentials,
        signal: controller ? controller.signal : undefined,
      });

      const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
        toCleanPath(path).startsWith(endpoint),
      );

      if (response.status === 401 && !_isRetry && !skipAuthRefresh && !isAuthEndpoint) {
        const refreshed = await refreshSessionToken(this.fetchFn, this.baseUrl);
        if (refreshed) {
          return this.request<T>(path, {
            ...options,
            _isRetry: true,
          });
        }

        handleAuthFailure();
        throw new ApiClientError(401, "Phiên đăng nhập đã hết hạn.", {
          detail: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        });
      }

      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new ApiClientError(response.status, response.statusText, errorData);
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      const json = await response.json();

      if (isApiEnvelope(json)) {
        if (!json.is_success) {
          throw new ApiClientError(response.status, response.statusText, json);
        }
        return json.data as T;
      }

      return json as T;
    } catch (error) {
      if (timedOut) {
        throw new ApiClientError(408, "Request timeout", {
          detail: `Yêu cầu ${toCleanPath(path)} quá thời gian chờ (${this.timeout / 1000} giây). Vui lòng thử lại hoặc kiểm tra kết nối backend.`,
        });
      }
      throw error;
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

function toCleanPath(path: string): string {
  return path.split("?")[0].replace(/^\/+/, "");
}

/** Endpoint tự xử lý 401 của mình — không được kích hoạt refresh token. */
const AUTH_ENDPOINTS = ["auth/login", "auth/refresh", "auth/logout", "auth/google"];

function isApiEnvelope(
  value: unknown,
): value is { message: string; is_success: boolean; data: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "is_success" in value &&
    "data" in value &&
    typeof value.is_success === "boolean"
  );
}
