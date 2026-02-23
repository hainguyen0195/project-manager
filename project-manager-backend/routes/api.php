<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\HostingController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ServicePackageController;
use App\Http\Controllers\Api\PortfolioController;

// Public routes
Route::get('/public/client/{code}', [ClientController::class, 'findByCode']);
Route::get('/public/portfolio', [PortfolioController::class, 'publicIndex']);
Route::get('/public/settings', [SettingController::class, 'index']);
Route::get('/public/packages', [ServicePackageController::class, 'index']);

// Admin API routes
Route::prefix('clients')->group(function () {
    Route::get('/', [ClientController::class, 'index']);
    Route::get('/all', [ClientController::class, 'all']);
    Route::post('/', [ClientController::class, 'store']);
    Route::get('/{client}', [ClientController::class, 'show']);
    Route::put('/{client}', [ClientController::class, 'update']);
    Route::delete('/{client}', [ClientController::class, 'destroy']);
});

Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::get('/statistics', [ProjectController::class, 'statistics']);
    Route::get('/features', [ProjectController::class, 'allFeatures']);
    Route::post('/', [ProjectController::class, 'store']);
    Route::get('/{project}', [ProjectController::class, 'show']);
    Route::post('/{project}', [ProjectController::class, 'update']);
    Route::delete('/{project}', [ProjectController::class, 'destroy']);
    Route::delete('/images/{projectImage}', [ProjectController::class, 'deleteImage']);
});

Route::prefix('hosting')->group(function () {
    Route::get('/expiring', [HostingController::class, 'expiring']);
    Route::get('/{project}/history', [HostingController::class, 'history']);
    Route::post('/{project}/renew', [HostingController::class, 'renew']);
    Route::post('/{project}/upgrade', [HostingController::class, 'upgrade']);
});

// Settings
Route::prefix('settings')->group(function () {
    Route::get('/', [SettingController::class, 'index']);
    Route::post('/', [SettingController::class, 'update']);
    Route::post('/logo', [SettingController::class, 'uploadLogo']);
});

// Service Packages
Route::prefix('service-packages')->group(function () {
    Route::get('/', [ServicePackageController::class, 'index']);
    Route::post('/', [ServicePackageController::class, 'store']);
    Route::get('/{servicePackage}', [ServicePackageController::class, 'show']);
    Route::put('/{servicePackage}', [ServicePackageController::class, 'update']);
    Route::delete('/{servicePackage}', [ServicePackageController::class, 'destroy']);
});

// Portfolio
Route::prefix('portfolio')->group(function () {
    Route::get('/categories', [PortfolioController::class, 'categories']);
    Route::post('/categories', [PortfolioController::class, 'storeCategory']);
    Route::put('/categories/{category}', [PortfolioController::class, 'updateCategory']);
    Route::delete('/categories/{category}', [PortfolioController::class, 'destroyCategory']);

    Route::get('/', [PortfolioController::class, 'index']);
    Route::post('/', [PortfolioController::class, 'store']);
    Route::post('/batch-add', [PortfolioController::class, 'batchAdd']);
    Route::post('/batch-remove', [PortfolioController::class, 'batchRemove']);
    Route::put('/{portfolio}', [PortfolioController::class, 'update']);
    Route::delete('/{portfolio}', [PortfolioController::class, 'destroy']);
});
