<?php

use App\Http\Controllers\Shopify\AuthController;
use App\Http\Controllers\Shopify\WebhookController;
use App\Http\Middleware\VerifyShopifyWebhook;
use Illuminate\Support\Facades\Route;

Route::middleware(['shopify.header'])->group(function () {
    Route::get('/', [AuthController::class, 'index'])->name('home');

    Route::post('webhooks/app/uninstalled', [WebhookController::class, 'handleUninstall'])
        ->middleware(VerifyShopifyWebhook::class);

    Route::get('auth', [AuthController::class, 'auth'])->name('auth');
    Route::get('auth/callback', [AuthController::class, 'callback'])->name('auth.callback');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/frontend.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/api.php';