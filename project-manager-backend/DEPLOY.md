# Hướng dẫn Deploy lên Hosting

## Cấu trúc sau khi build

```
project-manager-backend/
├── app/                    # Laravel app code
├── bootstrap/
├── config/
├── database/
│   └── database.sqlite     # Database SQLite
├── public/                 # Document root (trỏ hosting vào đây)
│   ├── app/                # React build output
│   │   ├── index.html
│   │   └── static/
│   ├── storage -> ../storage/app/public
│   ├── .htaccess
│   └── index.php
├── routes/
├── storage/
├── vendor/
├── .env
└── .htaccess               # Redirect về public/ nếu cần
```

## Bước 1: Build trên máy local

### Windows (PowerShell)
```powershell
cd C:\Users\PC\project-manager-backend
.\build-deploy.ps1
```

### Linux/Mac
```bash
cd /path/to/project-manager-backend
chmod +x build-deploy.sh
./build-deploy.sh
```

## Bước 2: Chuẩn bị file .env

Copy `.env.production` thành `.env` và chỉnh sửa:

```env
APP_URL=https://yourdomain.com
APP_DEBUG=false
APP_ENV=production

# Nếu dùng MySQL (khuyến nghị cho hosting)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ten_database
DB_USERNAME=ten_user
DB_PASSWORD=mat_khau
```

Generate APP_KEY:
```bash
php artisan key:generate
```

## Bước 3: Upload lên hosting

### Cách A: Shared Hosting (cPanel) - Document root trỏ được vào public/

1. Upload toàn bộ folder `project-manager-backend` lên hosting
2. Trong cPanel, trỏ **Document Root** vào folder `public/`
3. Hoặc tạo subdomain trỏ vào `public/`

### Cách B: Shared Hosting (cPanel) - Document root là public_html/

1. Upload nội dung folder `public/` vào `public_html/`
2. Upload các folder còn lại (app, bootstrap, config, database, routes, storage, vendor, .env) vào thư mục **ngang hàng** với `public_html/` (ví dụ: `/home/username/`)
3. Sửa file `public_html/index.php`:

```php
// Thay dòng:
require __DIR__.'/../vendor/autoload.php';
// Thành:
require __DIR__.'/../project-manager-backend/vendor/autoload.php';

// Thay dòng:
$app = require_once __DIR__.'/../bootstrap/app.php';
// Thành:
$app = require_once __DIR__.'/../project-manager-backend/bootstrap/app.php';
```

### Cách C: VPS (Ubuntu/CentOS)

```bash
# Upload code
scp -r project-manager-backend user@server:/var/www/

# Nginx config
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/project-manager-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## Bước 4: Chạy lệnh trên hosting

```bash
# Tạo database tables
php artisan migrate

# Tạo symlink storage
php artisan storage:link

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Bước 5: Phân quyền (Linux hosting)

```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

## Chuyển từ SQLite sang MySQL

Nếu hosting hỗ trợ MySQL (khuyến nghị):

1. Tạo database MySQL trên cPanel
2. Cập nhật `.env` với thông tin MySQL
3. Chạy: `php artisan migrate`
4. Dữ liệu cũ từ SQLite cần export/import thủ công

## Lưu ý quan trọng

- **KHÔNG** upload file `.env` lên git, chỉ cấu hình trực tiếp trên hosting
- Đảm bảo PHP >= 8.2 trên hosting
- Cần các PHP extensions: `pdo_sqlite` hoặc `pdo_mysql`, `mbstring`, `xml`, `gd`
- Folder `storage` và `bootstrap/cache` cần quyền ghi (775)
- Nếu upload ảnh không hoạt động, kiểm tra `php artisan storage:link`
