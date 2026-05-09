<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Frontend\BillingController;

Route::prefix("app")->middleware(['shopify.verify'])->name('app.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('frontend/welcome');
    })->name("index");

    Route::get('/billing', [BillingController::class, 'index'])->name('billing');
});

// Separate group for billing redirects to avoid middleware hijacking
Route::prefix("app/billing")->name('app.billing.')->group(function () {
    Route::get('/subscribe/{plan}', [BillingController::class, 'subscribe'])->name('subscribe');
    Route::get('/callback', [BillingController::class, 'callback'])->name('callback');
});
