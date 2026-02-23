<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

http_response_code(200);

$basePaths = [
    __DIR__ . '/..',
    __DIR__ . '/../project-manager-backend',
];

$basePath = null;
foreach ($basePaths as $path) {
    if (file_exists($path . '/vendor/autoload.php')) {
        $basePath = realpath($path);
        break;
    }
}

if (!$basePath) {
    die('Laravel not found. Check project-manager-backend location.');
}

if (file_exists($maintenance = $basePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $basePath . '/vendor/autoload.php';

/** @var Application $app */
$app = require_once $basePath . '/bootstrap/app.php';

$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
