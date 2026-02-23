<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

$serveFrontend = function () {
    $path = public_path('app/index.html');

    if (File::exists($path)) {
        $html = File::get($path);
        $html = str_replace('"./', '"/app/', $html);
        return response($html)->header('Content-Type', 'text/html');
    }

    return response()->json([
        'message' => 'React app not built yet. Run: npm run build in frontend directory.',
    ], 404);
};

Route::get('/', $serveFrontend);
Route::get('/login', $serveFrontend);
Route::get('/projects/{any?}', $serveFrontend)->where('any', '.*');
Route::get('/clients/{any?}', $serveFrontend)->where('any', '.*');
Route::get('/settings', $serveFrontend);
Route::get('/service-packages', $serveFrontend);
Route::get('/portfolio', $serveFrontend);
Route::get('/users', $serveFrontend);
Route::get('/pricing', $serveFrontend);
Route::get('/portfolio-showcase', $serveFrontend);
Route::get('/project-created/{any}', $serveFrontend)->where('any', '.*');
