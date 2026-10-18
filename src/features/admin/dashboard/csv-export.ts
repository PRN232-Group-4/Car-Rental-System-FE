/**
 * Hàm làm sạch và chống CSV Injection theo quy tắc bảo mật OWASP:
 * Nếu một ô bắt đầu bằng =, +, -, @ thì thêm dấu ' phía trước để Excel không thực thi công thức.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Chống CSV Injection
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // Escape dấu ngoặc kép kép
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export interface CsvExportPayload {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

/**
 * Xuất file CSV phía client với UTF-8 BOM chuẩn để Excel hiển thị tiếng Việt không bị lỗi font
 */
export function exportToCsv({ filename, headers, rows }: CsvExportPayload): void {
  const headerLine = headers.map(sanitizeCsvCell).join(",");
  const rowLines = rows.map((r) => r.map(sanitizeCsvCell).join(","));

  const csvContent = "\uFEFF" + [headerLine, ...rowLines].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
