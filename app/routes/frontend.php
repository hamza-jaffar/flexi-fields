<?php

use Illuminate\Support\Facades\Route;

Route::prefix("app")->middleware(['shopify.verify'])->name('app.')->group(function () {
    Route::get('/', function () {
        return "Hello, from Fronted App Page";
    })->name("index");
});
