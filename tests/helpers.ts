/** Bộ chọn dùng chung cho SearchWidget (trạm nhận xe + lịch trình di chuyển). */
export const SEARCH_CONSOLE = '#tim-xe > div';
export const STATION_BUTTON = '#tim-xe button[aria-haspopup="listbox"]';
export const TIME_BUTTON = '#tim-xe button[aria-haspopup="dialog"]';
export const STATION_PANEL = '[role="listbox"][aria-label="Chọn trạm nhận xe"]';
export const TIME_PANEL = '[role="dialog"][aria-label="Chọn thời gian nhận và trả xe"]';

/** Điểm trong nửa dưới của phần tử có phải do chính phần tử đó vẽ trên cùng không. */
export function probeOnTop(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return { found: false, hits: -1, total: 0 };
  el.scrollIntoView({ block: 'end' });
  const r = el.getBoundingClientRect();
  const xs = [r.left + 20, r.left + r.width / 2, r.right - 20];
  const ys = [r.top + r.height / 2, r.bottom - 12];
  let hits = 0;
  let total = 0;
  for (const x of xs) {
    for (const y of ys) {
      const px = Math.min(Math.max(x, 1), window.innerWidth - 1);
      const py = Math.min(Math.max(y, 1), window.innerHeight - 1);
      const top = document.elementFromPoint(px, py);
      total += 1;
      if (top && el.contains(top)) hits += 1;
    }
  }
  return { found: true, hits, total };
}

/** Các lớp màu Tailwind không đi qua token trong globals.css (điểm nhấn thứ hai). */
export function offTokenClasses(selectors: string[]) {
  const pattern = /\b(?:text|bg|border|ring)-(?:emerald|green|orange|amber|slate|neutral|zinc|stone|teal|cyan|blue|indigo|violet|purple|pink|rose|red|yellow|lime)-\d{2,3}(?:\/\d+)?\b|\b(?:text|bg|border|ring)-\[#[0-9a-fA-F]{3,8}\](?:\/\d+)?/g;
  const found: string[] = [];
  for (const selector of selectors) {
    const root = document.querySelector(selector);
    if (!root) continue;
    for (const el of [root, ...root.querySelectorAll('*')]) {
      const cls = typeof el.className === 'string' ? el.className : '';
      for (const match of cls.match(pattern) ?? []) found.push(`${selector}: ${match}`);
    }
  }
  return found;
}

/** Cỡ chữ nhỏ nhất của chữ HTML hiển thị trong các vùng được kiểm (bỏ qua nhãn trang trí trong SVG). */
export function smallestFontSize(selectors: string[]) {
  const roots = selectors.map((s) => document.querySelector(s)).filter((el): el is Element => el !== null);
  let smallest = Number.POSITIVE_INFINITY;
  for (const root of roots) {
    for (const el of [root, ...root.querySelectorAll('*')]) {
      if (el.children.length > 0) continue;
      if (el.closest('svg')) continue;
      const text = el.textContent?.trim();
      if (!text) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      smallest = Math.min(smallest, Number.parseFloat(getComputedStyle(el).fontSize));
    }
  }
  return Number.isFinite(smallest) ? smallest : 0;
}

/** Phần tử HTML tràn ra ngoài viewport (bỏ qua SVG và băng chuyền marquee chủ đích). */
export function overflowingElements(maxRight: number) {
  const offenders: string[] = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || el.closest('.will-change-transform')) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) continue;
    if (r.right > maxRight + 1) {
      const cls = typeof el.className === 'string' ? el.className : '';
      offenders.push(`${el.tagName}.${cls.slice(0, 40)} right=${Math.round(r.right)}`);
    }
  }
  return offenders.slice(0, 6);
}

/** Danh sách lớp `bg-*` của mọi nút khớp `text` — dùng để so biến thể CTA. */
export function buttonBackgrounds(text: string) {
  const found: string[] = [];
  for (const el of document.querySelectorAll('button')) {
    if (!(el.textContent ?? '').toUpperCase().includes(text.toUpperCase())) continue;
    found.push(
      (typeof el.className === 'string' ? el.className : '')
        .split(' ')
        .filter((c) => c.startsWith('bg-'))
        .sort()
        .join(','),
    );
  }
  return Array.from(new Set(found));
}
