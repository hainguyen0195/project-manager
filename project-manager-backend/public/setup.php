<?php
/**
 * Setup script cho hosting không có SSH.
 * XÓA FILE NÀY NGAY SAU KHI CHẠY XONG!
 */

$secret = 'xoa-ngay-sau-khi-dung-2026';

if (!isset($_GET['key']) || $_GET['key'] !== $secret) {
    http_response_code(403);
    die('Forbidden');
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$action = $_GET['action'] ?? '';
$output = '';

switch ($action) {
    case 'migrate':
        Artisan::call('migrate', ['--force' => true]);
        $output = Artisan::output();
        break;

    case 'storage-link':
        $target = storage_path('app/public');
        $link = public_path('storage');
        if (file_exists($link)) {
            $output = "Storage link already exists.\n";
        } else {
            if (symlink($target, $link)) {
                $output = "Storage link created successfully.\n";
            } else {
                $output = "Failed to create symlink. Trying copy method...\n";
                if (!is_dir($link)) mkdir($link, 0755, true);
                $output .= "Created storage directory. Upload files manually to storage/app/public/\n";
            }
        }
        break;

    case 'cache':
        Artisan::call('config:cache');
        $output .= Artisan::output();
        Artisan::call('route:cache');
        $output .= Artisan::output();
        Artisan::call('view:cache');
        $output .= Artisan::output();
        break;

    case 'clear':
        Artisan::call('config:clear');
        $output .= Artisan::output();
        Artisan::call('route:clear');
        $output .= Artisan::output();
        Artisan::call('cache:clear');
        $output .= Artisan::output();
        break;

    default:
        $output = "Available actions:\n";
        $output .= "- ?key={$secret}&action=migrate\n";
        $output .= "- ?key={$secret}&action=storage-link\n";
        $output .= "- ?key={$secret}&action=cache\n";
        $output .= "- ?key={$secret}&action=clear\n";
        break;
}

header('Content-Type: text/plain');
echo $output;
