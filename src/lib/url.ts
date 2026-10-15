import { z } from "zod";

/**
 * Làm sạch và xác thực đường dẫn chuyển hướng sau đăng nhập (next parameter).
 * Chống triệt để các lỗ hổng Open Redirect:
 * - Không cho phép URL tuyệt đối có schema (http:, https:, javascript:, data:, vbscript:)
 * - Không cho phép protocol-relative URL bắt đầu bằng '//' hoặc '/\'
 * - Không cho phép ký tự backslash '\\' ở đầu
 * - Bắt buộc phải là đường dẫn nội bộ bắt đầu bằng duy nhất một dấu gạch chéo '/'
 * - Trả về fallback '/' nếu phát hiện bất kỳ dấu hiệu nguy hiểm nào.
 */
export function sanitizeNext(path: string | null | undefined, fallback: string = "/"): string {
  if (!path || typeof path !== "string") {
    return fallback;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return fallback;
  }

  // Chặn các giao thức nguy hiểm
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return fallback;
  }

  // Chặn tuyệt đối URL chứa scheme (http://, https://, //)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Chặn protocol-relative hoặc biến thể gạch chéo (//evil.com, /\evil.com, \\evil.com)
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("\\\\") || trimmed.startsWith("\\")) {
    return fallback;
  }

  // Phải bắt đầu bằng một dấu gạch chéo đơn '/'
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  // Không cho phép ký tự điều khiển (control characters)
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return fallback;
  }

  return trimmed;
}

/**
 * Chuyển đổi và xác thực search params (URLSearchParams hoặc Record) thông qua Zod schema.
 */
export function parseSearchParams<T>(
  schema: z.ZodType<T>,
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
): T {
  const raw: Record<string, unknown> = {};

  if (searchParams instanceof URLSearchParams) {
    for (const [key, value] of searchParams.entries()) {
      if (raw[key] !== undefined) {
        if (Array.isArray(raw[key])) {
          (raw[key] as unknown[]).push(value);
        } else {
          raw[key] = [raw[key], value];
        }
      } else {
        raw[key] = value;
      }
    }
  } else {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        raw[key] = value;
      }
    }
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    // Trả về dữ liệu parse mặc định nếu schema có default, hoặc ném lỗi nếu schema strict
    return schema.parse({});
  }

  return result.data;
}

/**
 * Tuần tự hóa một đối tượng bộ lọc thành chuỗi query parameters.
 * Tự động loại bỏ các giá trị undefined, null, chuỗi rỗng và mảng rỗng.
 */
export function serializeSearchParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
