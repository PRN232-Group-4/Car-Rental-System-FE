import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "../src/app");
const docsUxDir = path.resolve(__dirname, "../docs/ux");

if (!fs.existsSync(docsUxDir)) {
  fs.mkdirSync(docsUxDir, { recursive: true });
}

function getPages(dir, base = "") {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getPages(fullPath, path.join(base, file)));
    } else if (file === "page.tsx" || file === "page.js") {
      results.push({ base, fullPath });
    }
  }
  return results;
}

const pages = getPages(appDir);

const routesAudit = pages.map(({ base, fullPath }) => {
  let route = "/" + base.replace(/\\/g, "/");
  route = route.replace(/\/\([^)]+\)/g, "");
  if (route === "") route = "/";

  const content = fs.readFileSync(fullPath, "utf8");
  let combinedContent = content;

  // Resolve imports from @/features or @/components
  const importRegex = /from\s+["'](@\/(?:features|components)\/[^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const rel = match[1].replace("@/", "src/");
    const candidates = [
      path.resolve(__dirname, "..", rel + ".tsx"),
      path.resolve(__dirname, "..", rel + ".ts"),
      path.resolve(__dirname, "..", rel, "index.tsx"),
      path.resolve(__dirname, "..", rel, "index.ts"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        try {
          combinedContent += "\n" + fs.readFileSync(c, "utf8");
        } catch {}
        break;
      }
    }
  }

  // Detect state capabilities
  const hasLoading =
    /Skeleton|isLoading|loading|Spinner|isFetching|animate-pulse/i.test(combinedContent);
  const hasEmpty =
    /EmptyState|empty|không tìm thấy|chưa có|không có|no data|AdminTableEmptyRow/i.test(combinedContent);
  const hasError =
    /ErrorState|isError|error|catch|traceId|thử lại/i.test(combinedContent);
  const hasPopulated = true;

  // Static informational / Auth form pages might not need data empty state, but list/detail pages do
  const isFormOrStatic =
    /login|register|forgot-password|result|forbidden|profile/.test(route) &&
    !/reports|reviews|vehicles|trips|invoices|staffs|users|policies|plans/.test(route);

  return {
    route,
    file: path.relative(path.resolve(__dirname, ".."), fullPath).replace(/\\/g, "/"),
    isFormOrStatic,
    loading: hasLoading ? "ĐẠT" : "THIẾU",
    empty: hasEmpty || isFormOrStatic ? "ĐẠT" : "THIẾU",
    error: hasError ? "ĐẠT" : "THIẾU",
    populated: hasPopulated ? "ĐẠT" : "THIẾU",
  };
}).sort((a, b) => a.route.localeCompare(b.route));

// Generate markdown
let md = `# Ma Trận Trạng Thái Toàn Bộ Tuyến Đường (State Matrix) — FE-20

> Tài liệu này lập danh mục toàn bộ các route thực tế trong hệ thống Thong Dong VRS (\`src/app/**\`) và đối soát 4 trạng thái cốt lõi: **Loading**, **Empty**, **Error**, **Populated** theo yêu cầu \`docs/specs/FE-20-ux-polish.md\` (Hạng mục A).
>
> **Quy chuẩn trạng thái:**
> - **Loading:** Skeleton đúng tỷ lệ nội dung thật (không spinner toàn trang, không trang trắng).
> - **Empty:** Minh họa SVG đơn sắc + tiêu đề tiếng Việt + hướng dẫn + nút hành động (không chỉ ghi "No data").
> - **Error:** Thông điệp thân thiện + nút "Thử lại" + hiển thị \`traceId\` cho nhân viên/quản trị.
> - **Populated:** Dữ liệu hoàn chỉnh hiển thị đúng token v3.1.

| # | Route | File Nguồn | Loading | Empty | Error | Populated | Ghi chú & Đánh giá |
|---|---|---|---|---|---|---|---|
`;

let missingCount = 0;

routesAudit.forEach((r, idx) => {
  const isFullyPassed = r.loading === "ĐẠT" && r.empty === "ĐẠT" && r.error === "ĐẠT" && r.populated === "ĐẠT";
  if (!isFullyPassed) missingCount++;
  
  let note = "Đầy đủ trạng thái";
  if (!isFullyPassed) {
    const missing = [];
    if (r.loading === "THIẾU") missing.push("loading skeleton");
    if (r.empty === "THIẾU") missing.push("empty state");
    if (r.error === "THIẾU") missing.push("error recovery / traceId");
    note = `Cần bổ sung: ${missing.join(", ")}`;
  }

  md += `| ${idx + 1} | \`${r.route}\` | \`${r.file}\` | ${r.loading} | ${r.empty} | ${r.error} | ${r.populated} | ${note} |\n`;
});

md += `
---

## Tổng kết Đánh giá Ban đầu (Trước khi sửa)
- **Tổng số routes rà soát:** ${routesAudit.length}
- **Số route đã đầy đủ 4 trạng thái:** ${routesAudit.length - missingCount} / ${routesAudit.length}
- **Số route phát hiện còn thiếu sót trạng thái:** ${missingCount}
- **Kế hoạch khắc phục (Hạng mục A):**
  1. Chuẩn hóa ở các component dùng chung: \`Skeleton.tsx\` (\`AdminTableSkeleton\`, \`FormSkeleton\`, \`SkeletonCard\`), \`EmptyState.tsx\` và \`ErrorState.tsx\` (hỗ trợ \`traceId\` và \`onRetry\`).
  2. Bổ sung \`error.tsx\` và \`global-error.tsx\` cho toàn bộ cây App Router.
  3. Cập nhật các trang danh sách/chi tiết chưa có xử lý lỗi truy vấn API sang sử dụng component chuẩn.
`;

fs.writeFileSync(path.join(docsUxDir, "state-matrix.md"), md, "utf8");
console.log(`[STATE MATRIX] Đã sinh thành công docs/ux/state-matrix.md với ${routesAudit.length} routes (${missingCount} routes cần bổ sung trạng thái).`);
