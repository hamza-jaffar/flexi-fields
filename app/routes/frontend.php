<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix("app")->middleware(['shopify.verify'])->name('app.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('frontend/welcome');
    })->name("index");
});
