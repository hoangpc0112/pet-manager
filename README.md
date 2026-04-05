# ANDROID PET MANAGER

## 🚀 Hướng dẫn cài đặt

```bash
npm i
npx expo start
```

## 🔁 Migrate dữ liệu cũ vào users/{uid}

Script này copy dữ liệu legacy từ collection gốc (`app_config/main`, `pets`, `journalEntries`) sang nhánh riêng của user (`users/{uid}/...`) để không mất dữ liệu đã tạo trước đây.

1. Chạy kiểm tra trước (không ghi dữ liệu):

```bash
npm run migrate:legacy-user -- --uid=YOUR_FIREBASE_UID --dry-run
```

2. Nếu kết quả đúng, chạy migrate thật:

```bash
npm run migrate:legacy-user -- --uid=YOUR_FIREBASE_UID
```

### Migrate cho tất cả user hiện có trong DB

Script sẽ lấy danh sách UID từ collection `users`, sau đó migrate lần lượt từng user.

1. Dry-run toàn bộ:

```bash
npm run migrate:legacy-all-users -- --dry-run
```

2. Chạy migrate thật toàn bộ:

```bash
npm run migrate:legacy-all-users
```

### Migrate theo danh sách UID thật từ Firebase Authentication

Nếu UID Auth không đồng bộ trong collection `users`, dùng một trong hai cách sau:

1. Truyền trực tiếp nhiều UID:

```bash
npm run migrate:legacy-user -- --uids=uid_1,uid_2,uid_3 --dry-run
```

2. Truyền file UID (`txt` mỗi dòng 1 UID, hoặc `json` là mảng UID):

```bash
npm run migrate:legacy-user -- --uids-file=./scripts/auth-uids.txt --dry-run
```

Ghi chú:
- Script mặc định không migrate `communityPosts` vì dữ liệu cộng đồng đang để dùng chung.
- Script không ghi đè doc đã tồn tại trong `users/{uid}/pets` và `users/{uid}/journalEntries`.
- Với `app_config/main`, script backfill dữ liệu thiếu từ legacy, ưu tiên giữ dữ liệu user đã có.
- Nếu cần migrate cả `communityPosts` vào nhánh user, thêm `--include-community`.
- Chỉ chọn một mode mỗi lần chạy: `--uid` hoặc `--uids` hoặc `--uids-file` hoặc `--all-users`.