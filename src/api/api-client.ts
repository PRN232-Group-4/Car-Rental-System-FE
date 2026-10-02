export interface ApiClientConfig {
  baseUrl?: string;
  customFetch?: typeof fetch;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export class ApiClientError extends Error {
  public status: number;
  public statusText: string;
  public data: unknown;

  constructor(status: number, statusText: string, data: unknown) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `API Error [${status}]: ${statusText}`;
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

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...restOptions } = options;
    const url = this.buildUrl(path, params);

    const mergedHeaders: HeadersInit = {
      ...this.defaultHeaders,
      ...headers,
    };

    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), this.timeout)
      : null;

    try {
      const response = await this.fetchFn(url, {
        ...restOptions,
        headers: mergedHeaders,
        signal: controller ? controller.signal : undefined,
      });

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

      return (await response.json()) as T;
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
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}
