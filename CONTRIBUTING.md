# Quy ước đóng góp — Car Rental System FE

## 1. Commit message (Conventional Commits)

```
<type>(<scope>): <subject>

<body — vì sao, không lặp lại cái gì>

<footer — BREAKING CHANGE: ..., refs #issue>
```

- `subject`: tiếng Anh, động từ mệnh lệnh ("add", "fix", "remove" — không "added/adding"),
  không viết hoa chữ đầu, không chấm cuối, tối đa 72 ký tự.
- **1 commit = 1 mục đích.** Không trộn refactor với feature/fix, không trộn đổi format với đổi logic.
- Body chỉ viết khi cần giải thích *vì sao* (ngữ cảnh, trade-off, lỗi gốc). Không mô tả lại diff.
- Không commit `.env*`, token, connection string, API key (đã có trong `.gitignore` — đừng dùng `git add -f`).

### type

| type       | dùng khi                                                    |
| ---------- | ----------------------------------------------------------- |
| `feat`     | thêm tính năng / hành vi mới cho người dùng                 |
| `fix`      | sửa lỗi                                                     |
| `docs`     | chỉ đổi tài liệu (`docs/`, `changes/`, `*.md`)              |
| `style`    | format, CSS, màu sắc, spacing — không đổi logic             |
| `refactor` | đổi cấu trúc code, không đổi hành vi                        |
| `perf`     | cải thiện hiệu năng                                         |
| `test`     | thêm/sửa test                                               |
| `build`    | build, bundler, config Next/wrangler                        |
| `ci`       | GitHub Actions                                              |
| `chore`    | việc lặt vặt: deps, gitignore, script nội bộ                 |
| `revert`   | hoàn tác commit trước                                        |

### scope (vùng thay đổi)

`api` · `auth` · `mock` · `ui` · `landing` · `dashboard` · `booking` · `invoice` · `payment` ·
`subscription` · `license` · `vehicle` · `worker` · `deps` · `ci` · `docs` · `scripts`

Scope là tuỳ chọn nhưng nên có khi commit chỉ chạm một vùng.

### Ví dụ (theo lịch sử repo)

```
feat(api): add typed HTTP client, session refresh and BE schema
feat(customer): add booking, invoice, payment, license and subscription flows
feat(deploy): proxy /api through the cloudflare worker
fix(ui): add smooth scroll-to-top on logo click
style(marketing): polish landing surfaces, typography and motion
chore(deps): add react-query and vitest tooling
test(api): cover mock handlers and envelope unwrapping
docs: add commit convention and dated change log
```

Sai:

```
update code                     # thiếu type + subject mơ hồ
fix: fix bug login and refactor # 2 mục đích trong 1 commit, lặp "fix"
Feat(Api): Added new API.       # sai format, subject viết hoa + thì quá khứ
```

## 2. Trước khi commit

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

- Bốn lệnh trên phải pass (CI chạy đúng 4 bước này).
- Thay đổi có ảnh hưởng nghiệp vụ/ngữ cảnh: thêm `changes/YYYY-MM-DD-<slug>.md`
  và thêm 1 dòng vào đầu `changes/CHANGELOG.md`.
- Chạy API thật cần `.env.local` với `NEXT_PUBLIC_API_URL=/api` (không còn chế độ mock/dữ liệu mẫu trong app).
  File này bị gitignore nên **build từ CI/git sẽ rơi vào mock mode** nếu không set 2 biến đó ở môi trường build.

## 3. Nhánh, PR, deploy

- Nhánh: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`; mở PR vào `main`.
- CI (`.github/workflows/ci.yml`): lint → typecheck → test → build. PR không xanh thì không merge.
- Deploy production là **thủ công** (CI không deploy):

  ```bash
  npm run build && npx wrangler deploy
  ```

  Worker: `car-rental-system-fe` → https://car-rental-system-fe.phucthan308.workers.dev
