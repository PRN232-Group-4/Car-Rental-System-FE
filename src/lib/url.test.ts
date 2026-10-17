import { describe, it, expect } from "vitest";
import { z } from "zod";
import { sanitizeNext, parseSearchParams, serializeSearchParams } from "./url";

describe("sanitizeNext (Open Redirect Defense)", () => {
  it("allows safe internal paths", () => {
    expect(sanitizeNext("/")).toBe("/");
    expect(sanitizeNext("/admin")).toBe("/admin");
    expect(sanitizeNext("/admin/vehicles?tab=active")).toBe("/admin/vehicles?tab=active");
    expect(sanitizeNext("/profile")).toBe("/profile");
  });

  it("blocks protocol-relative URLs", () => {
    expect(sanitizeNext("//evil.com")).toBe("/");
    expect(sanitizeNext("//evil.com/phish")).toBe("/");
    expect(sanitizeNext("///evil.com")).toBe("/");
    expect(sanitizeNext("/\\evil.com")).toBe("/");
  });

  it("blocks Windows backslash paths", () => {
    expect(sanitizeNext("\\\\evil.com")).toBe("/");
    expect(sanitizeNext("\\evil.com")).toBe("/");
  });

  it("blocks absolute URLs with schema", () => {
    expect(sanitizeNext("http://evil.com")).toBe("/");
    expect(sanitizeNext("https://evil.com/login")).toBe("/");
    expect(sanitizeNext("ftp://evil.com")).toBe("/");
  });

  it("blocks dangerous execution protocols", () => {
    expect(sanitizeNext("javascript:alert(document.cookie)")).toBe("/");
    expect(sanitizeNext("data:text/html,<script>alert(1)</script>")).toBe("/");
    expect(sanitizeNext("vbscript:msgbox(1)")).toBe("/");
  });

  it("blocks relative paths not starting with slash", () => {
    expect(sanitizeNext("admin/vehicles")).toBe("/");
    expect(sanitizeNext("evil.com")).toBe("/");
  });

  it("falls back safely on null, undefined, whitespace, or custom fallback", () => {
    expect(sanitizeNext(null)).toBe("/");
    expect(sanitizeNext(undefined)).toBe("/");
    expect(sanitizeNext("   ")).toBe("/");
    expect(sanitizeNext(null, "/custom-fallback")).toBe("/custom-fallback");
    expect(sanitizeNext("https://evil.com", "/custom-fallback")).toBe("/custom-fallback");
  });
});

describe("parseSearchParams", () => {
  const filterSchema = z.object({
    category: z.string().default("all"),
    page: z.coerce.number().default(1),
    availableOnly: z
      .string()
      .optional()
      .transform((val) => val === "true"),
  });

  it("parses URLSearchParams with defaults", () => {
    const params = new URLSearchParams("category=suv&page=2&availableOnly=true");
    const parsed = parseSearchParams(filterSchema, params);
    expect(parsed).toEqual({
      category: "suv",
      page: 2,
      availableOnly: true,
    });
  });

  it("applies default values when params are missing", () => {
    const params = new URLSearchParams();
    const parsed = parseSearchParams(filterSchema, params);
    expect(parsed).toEqual({
      category: "all",
      page: 1,
      availableOnly: false,
    });
  });

  it("parses Record input safely", () => {
    const raw = { category: "sedan", page: "3" };
    const parsed = parseSearchParams(filterSchema, raw);
    expect(parsed.category).toBe("sedan");
    expect(parsed.page).toBe(3);
  });
});

describe("serializeSearchParams", () => {
  it("serializes filter objects and strips empty/null/undefined values", () => {
    const filters = {
      category: "suv",
      empty: "",
      nil: null,
      undef: undefined,
      page: 2,
    };
    expect(serializeSearchParams(filters)).toBe("?category=suv&page=2");
  });

  it("handles array parameters", () => {
    const filters = {
      tags: ["eco", "premium"],
      page: 1,
    };
    expect(serializeSearchParams(filters)).toBe("?tags=eco&tags=premium&page=1");
  });

  it("returns empty string when all fields are empty", () => {
    expect(serializeSearchParams({ a: "", b: null, c: undefined })).toBe("");
  });
});
