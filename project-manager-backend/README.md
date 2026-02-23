# Project Manager

Ứng dụng quản lý dự án - Laravel 12 + React 19.

## Yêu cầu hệ thống

- PHP >= 8.2 (extensions: `pdo_mysql`, `mbstring`, `xml`, `gd`, `fileinfo`)
- MySQL 5.7+ hoặc SQLite
- Node.js >= 18 (chỉ cần trên máy local để build)

## Cài đặt local (Development)

```bash
# Backend
cd project-manager-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link

# Frontend
cd project-manager-frontend
npm install
npm start
```

## Build cho Production

Chạy script trên máy local (Windows PowerShell):

```powershell
cd project-manager-backend
.\build-deploy.ps1
```

Script sẽ tự động:
1. Build React frontend
2. Copy build vào `public/app/`
3. Cache Laravel config/route/view

---

## Deploy lên DirectAdmin (không cần SSH)

### Bước 1: Tạo Database MySQL

1. Đăng nhập **DirectAdmin**
2. Vào **MySQL Management** → **Create new Database**
3. Ghi nhớ 3 thông tin: **tên database**, **tên user**, **mật khẩu**

### Bước 2: Chuẩn bị file `.env`

Copy `.env.production` thành `.env`, sửa lại:

```env
APP_URL=https://yourdomain.com
APP_KEY=base64:xxxxxxxx  # Lấy từ: php artisan key:generate --show

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ten_database
DB_USERNAME=ten_user
DB_PASSWORD=mat_khau
```

### Bước 3: Upload lên hosting

Cấu trúc thư mục trên DirectAdmin:

```
/home/username/
├── domains/
│   └── yourdomain.com/
│       └── public_html/       ← Document root
├── project-manager-backend/   ← Upload vào đây
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   │   └── app/               ← React build (đã có sẵn)
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   └── .env                   ← File đã sửa ở bước 2
```

**Thực hiện:**

1. Upload thư mục `project-manager-backend` vào `/home/username/` (ngang hàng với `domains/`)

2. Copy **nội dung** thư mục `project-manager-backend/public/` vào `public_html/`:
   - `index.php`
   - `.htaccess`
   - Thư mục `app/`

3. Sửa file `public_html/index.php` — đổi path cho đúng:

```php
// Tìm dòng:
require __DIR__.'/../vendor/autoload.php';
// Đổi thành:
require __DIR__.'/../project-manager-backend/vendor/autoload.php';
```

```php
// Tìm dòng có bootstrap/app.php, đổi thành:
$app = require_once __DIR__.'/../project-manager-backend/bootstrap/app.php';
```

4. Copy file `.env` vào `project-manager-backend/`

### Bước 4: Chạy setup qua trình duyệt

Vì không có SSH, truy cập file `setup.php` (đã có sẵn trong `public/`) qua trình duyệt:

1. **Tạo database tables:**

```
https://yourdomain.com/setup.php?key=xoa-ngay-sau-khi-dung-2026&action=migrate
```

2. **Tạo storage link:**

```
https://yourdomain.com/setup.php?key=xoa-ngay-sau-khi-dung-2026&action=storage-link
```

3. **Cache config:**

```
https://yourdomain.com/setup.php?key=xoa-ngay-sau-khi-dung-2026&action=cache
```

### Bước 5: Xóa file setup.php

> **⚠️ BẮT BUỘC:** Vào File Manager, xóa ngay `public_html/setup.php` sau khi chạy xong để đảm bảo bảo mật.

### Xử lý lỗi thường gặp

| Lỗi | Cách sửa |
|-----|----------|
| 500 Internal Server Error | Kiểm tra `.env` đã đúng chưa, permission `storage/` → 755 |
| Page not found (404) | Kiểm tra `.htaccess` trong `public_html/` |
| Upload ảnh không hoạt động | Chạy lại `setup.php?action=storage-link`, permission `storage/` → 755 |
| Database connection refused | Kiểm tra thông tin DB trong `.env` |
| Trang trắng | Vào `storage/logs/laravel.log` xem chi tiết lỗi |

### Phân quyền (nếu cần)

Trong File Manager, đổi permission:
- `project-manager-backend/storage/` → **755** (recursive)
- `project-manager-backend/bootstrap/cache/` → **755**

---

## Cập nhật sau này

Khi cần update code mới:

1. Chạy `.\build-deploy.ps1` trên máy local
2. Upload lại các file đã thay đổi lên hosting
3. Truy cập `setup.php?action=clear` để xóa cache cũ
4. Truy cập `setup.php?action=cache` để tạo cache mới
5. Nếu có migration mới: `setup.php?action=migrate`
6. **Xóa `setup.php`** sau khi xong
