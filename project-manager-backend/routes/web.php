<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

// Serve React app - all non-API routes fallback to React's index.html
Route::get('/{any?}', function () {
    $path = public_path('app/index.html');

    if (File::exists($path)) {
        return File::get($path);
    }

    // Fallback for development (when React build is not available)
    return response()->json([
        'message' => 'React app not built yet. Run: npm run build in frontend directory.',
    ], 404);
})->where('any', '^(?!api|storage).*$');
