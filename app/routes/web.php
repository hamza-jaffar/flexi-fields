<?php

use App\Http\Controllers\Shopify\AuthController;
use App\Http\Controllers\Shopify\WebhookController;
use App\Http\Middleware\VerifyShopifyWebhook;
use Illuminate\Support\Facades\Route;

Route::group([], function () {
    Route::get('/', [AuthController::class, 'index'])->name('home');

    Route::prefix('webhooks')->middleware('shopify.webhook')->group(function () {
        Route::post('app/uninstalled', [WebhookController::class, 'handleUninstall']);
        Route::post('customers/data_request', [WebhookController::class, 'customersDataRequest']);
        Route::post('customers/redact', [WebhookController::class, 'customersRedact']);
        Route::post('shop/redact', [WebhookController::class, 'shopRedact']);
    });

    Route::get('auth', [AuthController::class, 'auth'])->name('auth');
    Route::get('auth/callback', [AuthController::class, 'callback'])->name('auth.callback');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/frontend.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/api.php';