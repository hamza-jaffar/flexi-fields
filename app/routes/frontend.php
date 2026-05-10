<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Frontend\BillingController;

Route::prefix("app")->middleware(['shopify.verify'])->name('app.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Frontend\DashboardController::class, 'index'])->name("index");

    Route::get('/billing', [BillingController::class, 'index'])->name('billing');

    Route::prefix('/custom-field')->name('custom-field.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'store'])->name('store');
        Route::post('/bulk-destroy', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'bulkDestroy'])->name('bulk-destroy');
        Route::post('/reorder', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'reorder'])->name('reorder');
        Route::get('/{customField}/edit', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'edit'])->name('edit');
        Route::put('/{customField}', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'update'])->name('update');
        Route::delete('/{customField}', [\App\Http\Controllers\Frontend\CustomFieldController::class, 'destroy'])->name('destroy');
    });
});

// Separate group for billing redirects to avoid middleware hijacking
Route::prefix("app/billing")->name('app.billing.')->group(function () {
    Route::get('/subscribe/{plan}', [BillingController::class, 'subscribe'])->name('subscribe');
    Route::get('/callback', [BillingController::class, 'callback'])->name('callback');
});
