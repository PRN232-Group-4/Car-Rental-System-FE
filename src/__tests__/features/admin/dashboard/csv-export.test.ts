import { describe, it, expect, vi } from "vitest";
import { sanitizeCsvCell, exportToCsv } from "@/features/admin/dashboard/csv-export";

describe("Dashboard CSV Export & Security", () => {
  describe("sanitizeCsvCell - Chống CSV Injection", () => {
    it("thêm dấu nháy đơn ' trước các ký tự công thức =, +, -, @", () => {
      expect(sanitizeCsvCell("=SUM(A1:A10)")).toBe(`"'=SUM(A1:A10)"`);
      expect(sanitizeCsvCell("+12345")).toBe(`"'+12345"`);
      expect(sanitizeCsvCell("-50000")).toBe(`"'-50000"`);
      expect(sanitizeCsvCell("@cmd")).toBe(`"'@cmd"`);
    });

    it("xử lý null và undefined an toàn", () => {
      expect(sanitizeCsvCell(null)).toBe('""');
      expect(sanitizeCsvCell(undefined)).toBe('""');
    });

    it("escape dấu ngoặc kép kép chính xác", () => {
      expect(sanitizeCsvCell('VinFast "VF 8" Plus')).toBe('"VinFast ""VF 8"" Plus"');
    });

    it("giữ nguyên các chuỗi an toàn thông thường", () => {
      expect(sanitizeCsvCell("Hà Nội")).toBe('"Hà Nội"');
      expect(sanitizeCsvCell(123456)).toBe('"123456"');
    });
  });

  describe("exportToCsv", () => {
    it("tạo Blob chứa UTF-8 BOM và kích hoạt tải xuống", () => {
      const createObjectURLMock = vi.fn().mockReturnValue("blob:mock-url");
      const revokeObjectURLMock = vi.fn();
      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      const appendChildSpy = vi.spyOn(document.body, "appendChild");
      const removeChildSpy = vi.spyOn(document.body, "removeChild");

      exportToCsv({
        filename: "test-report",
        headers: ["Tên xe", "Doanh thu"],
        rows: [
          ["VinFast VF 8", 48000000],
          ["Mazda CX-5", 38000000],
        ],
      });

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:mock-url");
    });
  });
});
