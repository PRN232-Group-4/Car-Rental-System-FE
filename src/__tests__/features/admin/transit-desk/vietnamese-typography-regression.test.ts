import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Phase 3C — Vietnamese Typography & NFC Integrity Regression", () => {
  const transitDeskDir = path.resolve(process.cwd(), "src/features/admin/transit-desk");
  const combiningMarkRegex = /[\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/;

  const targetPhrases = [
    "Xử lý khiếu nại & Báo cáo sự cố",
    "Chuỗi bước vận hành bàn giao & thu hồi xe",
    "Xác nhận chuyển trạng thái cuối",
    "Xác nhận đặt cọc & gán tài xế",
    "Đến lượt xử lý",
    "Sổ phương tiện",
    "Ca trực đang diễn ra",
    "Hành trình vận hành đơn thuê",
  ];

  it("mọi chuỗi mẫu kiểm tra đều ở dạng Unicode NFC chuẩn, không chứa ký tự tổ hợp tách rời", () => {
    for (const phrase of targetPhrases) {
      // 1. Phải bằng chính nó khi gọi normalize('NFC')
      expect(phrase).toBe(phrase.normalize("NFC"));
      // 2. Không chứa combining diacritical marks
      expect(combiningMarkRegex.test(phrase)).toBe(false);
      // 3. Không có dấu cách U+0020 đứng trước dấu thanh
      expect(phrase).not.toMatch(/\s[\u0300-\u036f]/);
    }
  });

  it("tất cả mã nguồn transit-desk (*.tsx, *.ts) không chứa combining marks phân rã", () => {
    const files = fs.readdirSync(transitDeskDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = fs.readFileSync(path.join(transitDeskDir, file), "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        const hasCombining = combiningMarkRegex.test(line);
        if (hasCombining) {
          throw new Error(`File ${file} dòng ${idx + 1} chứa combining mark phân rã: "${line.trim()}"`);
        }
      });
      expect(content).toBe(content.normalize("NFC"));
    }
  });

  it("không có bất kỳ class font-serif nào trong transit-desk làm hỏng font tiếng Việt", () => {
    const files = fs.readdirSync(transitDeskDir).filter((f) => f.endsWith(".tsx"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(transitDeskDir, file), "utf8");
      expect(content.includes("font-serif")).toBe(false);
    }
  });

  it("chỉ có một theme giấy/mực: --td-rule dùng đường kẻ chung, không còn khối theme tối", () => {
    const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(globalsCss).toContain("--td-rule: var(--line);");
    expect(globalsCss).not.toMatch(/data-(admin-)?theme="dark"/);
    expect(globalsCss).toContain("--font-serif: var(--font-be-vietnam)");
  });
});
