<?php
/**
 * Setup script cho hosting không có SSH.
 * XÓA FILE NÀY NGAY SAU KHI CHẠY XONG!
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$secret = 'xoa-ngay-sau-khi-dung-2026';

if (!isset($_GET['key']) || $_GET['key'] !== $secret) {
    http_response_code(403);
    die('Forbidden');
}

$action = $_GET['action'] ?? '';

header('Content-Type: text/plain; charset=utf-8');

try {
    define('LARAVEL_START', microtime(true));

    $autoloadPaths = [
        __DIR__ . '/../vendor/autoload.php',
        __DIR__ . '/../project-manager-backend/vendor/autoload.php',
    ];

    $autoload = null;
    foreach ($autoloadPaths as $path) {
        if (file_exists($path)) {
            $autoload = $path;
            break;
        }
    }

    if (!$autoload) {
        die("ERROR: vendor/autoload.php not found.\nSearched:\n" . implode("\n", $autoloadPaths));
    }

    require $autoload;

    $bootstrapPaths = [
        __DIR__ . '/../bootstrap/app.php',
        __DIR__ . '/../project-manager-backend/bootstrap/app.php',
    ];

    $bootstrap = null;
    foreach ($bootstrapPaths as $path) {
        if (file_exists($path)) {
            $bootstrap = $path;
            break;
        }
    }

    if (!$bootstrap) {
        die("ERROR: bootstrap/app.php not found.\nSearched:\n" . implode("\n", $bootstrapPaths));
    }

    $app = require_once $bootstrap;
    $app->usePublicPath(__DIR__);

    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $output = '';

    switch ($action) {
        case 'create-admin':
            $email = $_GET['email'] ?? 'admin@admin.com';
            $password = $_GET['password'] ?? 'admin123';
            $name = $_GET['name'] ?? 'Admin';

            $existing = \App\Models\User::where('email', $email)->first();
            if ($existing) {
                $existing->update(['role' => 'admin']);
                $output = "User '{$email}' already exists. Updated role to admin.\n";
            } else {
                \App\Models\User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => $password,
                    'role' => 'admin',
                ]);
                $output = "Admin created!\n";
                $output .= "Email: {$email}\n";
                $output .= "Password: {$password}\n";
            }
            $output .= "\nREMEMBER: Change your password after first login!\n";
            break;

        case 'key-generate':
            $envFile = base_path('.env');
            $output .= "ENV file: {$envFile}\n";
            $output .= "Exists: " . (file_exists($envFile) ? "YES" : "NO") . "\n";
            $output .= "Writable: " . (is_writable($envFile) ? "YES" : "NO") . "\n\n";

            if (!file_exists($envFile)) {
                $exampleEnv = base_path('.env.production');
                if (!file_exists($exampleEnv)) {
                    $exampleEnv = base_path('.env.example');
                }
                if (file_exists($exampleEnv)) {
                    copy($exampleEnv, $envFile);
                    $output .= "Copied from: {$exampleEnv}\n";
                } else {
                    $output .= "ERROR: No .env template found!\n";
                    break;
                }
            }

            $key = 'base64:' . base64_encode(random_bytes(32));
            $env = file_get_contents($envFile);

            if (preg_match('/^APP_KEY=(.*)$/m', $env, $matches)) {
                $env = str_replace('APP_KEY=' . $matches[1], 'APP_KEY=' . $key, $env);
            } else {
                $env = "APP_KEY={$key}\n" . $env;
            }

            file_put_contents($envFile, $env);
            $output .= "APP_KEY set to: {$key}\n";
            $output .= "DONE!\n";
            break;

        case 'env-check':
            $envFile = base_path('.env');
            $output .= "ENV file: {$envFile}\n";
            $output .= "Exists: " . (file_exists($envFile) ? "YES" : "NO") . "\n";
            if (file_exists($envFile)) {
                $env = file_get_contents($envFile);
                preg_match('/^APP_KEY=(.*)$/m', $env, $matches);
                $output .= "APP_KEY: " . ($matches[1] ?? '(not set)') . "\n";
                preg_match('/^APP_ENV=(.*)$/m', $env, $matches);
                $output .= "APP_ENV: " . ($matches[1] ?? '(not set)') . "\n";
                preg_match('/^APP_DEBUG=(.*)$/m', $env, $matches);
                $output .= "APP_DEBUG: " . ($matches[1] ?? '(not set)') . "\n";
                preg_match('/^DB_CONNECTION=(.*)$/m', $env, $matches);
                $output .= "DB_CONNECTION: " . ($matches[1] ?? '(not set)') . "\n";
                preg_match('/^DB_DATABASE=(.*)$/m', $env, $matches);
                $output .= "DB_DATABASE: " . ($matches[1] ?? '(not set)') . "\n";
            }
            break;

        case 'migrate':
            Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            $output = Illuminate\Support\Facades\Artisan::output();
            break;

        case 'storage-link':
            $target = storage_path('app/public');
            $link = public_path('storage');
            $output .= "Target: {$target}\n";
            $output .= "Link: {$link}\n\n";

            if (!is_dir($target)) {
                @mkdir($target, 0755, true);
                $output .= "Created target directory.\n";
            }

            if (file_exists($link) || is_link($link)) {
                $output .= "Storage link already exists.\n";
            } else {
                if (@symlink($target, $link)) {
                    $output .= "Symlink created successfully.\n";
                } else {
                    $output .= "Symlink failed (hosting may not support it).\n";
                    $output .= "Try creating it manually in File Manager.\n";
                }
            }
            break;

        case 'cache':
            Illuminate\Support\Facades\Artisan::call('config:cache');
            $output .= Illuminate\Support\Facades\Artisan::output();
            Illuminate\Support\Facades\Artisan::call('route:cache');
            $output .= Illuminate\Support\Facades\Artisan::output();
            Illuminate\Support\Facades\Artisan::call('view:cache');
            $output .= Illuminate\Support\Facades\Artisan::output();
            break;

        case 'clear':
            Illuminate\Support\Facades\Artisan::call('config:clear');
            $output .= Illuminate\Support\Facades\Artisan::output();
            Illuminate\Support\Facades\Artisan::call('route:clear');
            $output .= Illuminate\Support\Facades\Artisan::output();
            Illuminate\Support\Facades\Artisan::call('view:clear');
            $output .= Illuminate\Support\Facades\Artisan::output();
            Illuminate\Support\Facades\Artisan::call('cache:clear');
            $output .= Illuminate\Support\Facades\Artisan::output();
            break;

        case 'fix-api':
            $apiDir = public_path('api');
            if (!is_dir($apiDir)) {
                mkdir($apiDir, 0755, true);
                $output .= "Created api/ directory\n";
            }

            $htaccess = 'FallbackResource /api/index.php';
            file_put_contents($apiDir . '/.htaccess', $htaccess);
            $output .= "Created api/.htaccess\n";

            $indexPhp = '<?php' . "\n\n" . 'chdir(dirname(__DIR__));' . "\n" . 'require __DIR__ . "/../index.php";' . "\n";
            file_put_contents($apiDir . '/index.php', $indexPhp);
            $output .= "Created api/index.php\n";

            $output .= "\nFiles in api/:\n";
            foreach (scandir($apiDir) as $f) {
                if ($f === '.' || $f === '..') continue;
                $output .= "  - {$f}\n";
            }
            $output .= "\nDONE! Try /api/clients now.\n";
            break;

        case 'routes':
            Illuminate\Support\Facades\Artisan::call('route:list', ['--json' => true]);
            $routes = json_decode(Illuminate\Support\Facades\Artisan::output(), true);
            if ($routes) {
                foreach ($routes as $route) {
                    $output .= sprintf("%-8s %-40s %s\n",
                        $route['method'] ?? '',
                        $route['uri'] ?? '',
                        $route['action'] ?? ''
                    );
                }
            } else {
                Illuminate\Support\Facades\Artisan::call('route:list');
                $output = Illuminate\Support\Facades\Artisan::output();
            }
            break;

        case 'check':
            $output .= "PHP Version: " . phpversion() . "\n";
            $output .= "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
            $output .= "Script Path: " . __DIR__ . "\n";
            $output .= "Autoload: {$autoload}\n";
            $output .= "Bootstrap: {$bootstrap}\n";
            $output .= "Base Path: " . base_path() . "\n";
            $output .= "Public Path: " . public_path() . "\n";
            $output .= "Storage Path: " . storage_path() . "\n";
            $output .= "\nPHP Extensions:\n";
            foreach (['pdo_mysql', 'pdo_sqlite', 'mbstring', 'xml', 'gd', 'fileinfo'] as $ext) {
                $output .= "  - {$ext}: " . (extension_loaded($ext) ? "OK" : "MISSING") . "\n";
            }
            $output .= "\nWritable:\n";
            $output .= "  - storage/: " . (is_writable(storage_path()) ? "OK" : "NO") . "\n";
            $output .= "  - bootstrap/cache/: " . (is_writable(base_path('bootstrap/cache')) ? "OK" : "NO") . "\n";
            break;

        case 'log':
            $logFile = storage_path('logs/laravel.log');
            if (file_exists($logFile)) {
                $lines = file($logFile);
                $output = implode('', array_slice($lines, -80));
            } else {
                $output = "Log file not found: {$logFile}\n";
            }
            break;

        case 'debug-on':
            $envFile = base_path('.env');
            if (file_exists($envFile)) {
                $env = file_get_contents($envFile);
                $env = preg_replace('/APP_DEBUG=\w+/', 'APP_DEBUG=true', $env);
                file_put_contents($envFile, $env);
                Illuminate\Support\Facades\Artisan::call('config:clear');
                $output = "APP_DEBUG set to true. Refresh your site to see detailed errors.\n";
                $output .= "REMEMBER: Run action=debug-off when done!\n";
            }
            break;

        case 'debug-off':
            $envFile = base_path('.env');
            if (file_exists($envFile)) {
                $env = file_get_contents($envFile);
                $env = preg_replace('/APP_DEBUG=\w+/', 'APP_DEBUG=false', $env);
                file_put_contents($envFile, $env);
                Illuminate\Support\Facades\Artisan::call('config:clear');
                $output = "APP_DEBUG set to false.\n";
            }
            break;

        case 'send-notifications':
            \Illuminate\Support\Facades\Artisan::call('notifications:send-expiry', [
                '--days' => $_GET['days'] ?? 7,
            ]);
            $output = \Illuminate\Support\Facades\Artisan::output();
            break;

        default:
            $output = "=== Project Manager Setup ===\n\n";
            $output .= "Available actions:\n\n";
            $output .= "1. Check environment:\n";
            $output .= "   ?key={$secret}&action=check\n\n";
            $output .= "2. Run migrations:\n";
            $output .= "   ?key={$secret}&action=migrate\n\n";
            $output .= "3. Create storage link:\n";
            $output .= "   ?key={$secret}&action=storage-link\n\n";
            $output .= "4. Cache config:\n";
            $output .= "   ?key={$secret}&action=cache\n\n";
            $output .= "5. Clear cache:\n";
            $output .= "   ?key={$secret}&action=clear\n\n";
            $output .= "6. Create admin user:\n";
            $output .= "   ?key={$secret}&action=create-admin&email=admin@admin.com&password=admin123\n\n";
            $output .= "7. Send expiry notifications:\n";
            $output .= "   ?key={$secret}&action=send-notifications&days=7\n\n";
            break;
    }

    echo $output;

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
