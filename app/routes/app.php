<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('app')->name('app.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Frontend/Welcome');
    })->name('welcome');

    Route::get('/custom-fields', function () {
        return Inertia::render('Frontend/CustomFields');
    })->name('custom-fields');

    Route::get('/settings', function () {
        return Inertia::render('Frontend/Settings');
    })->name('settings');
});
