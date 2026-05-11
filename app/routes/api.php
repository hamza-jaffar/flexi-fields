<?php

use Illuminate\Support\Facades\Route;

Route::prefix('api')->name('api.')->group(function () {

    Route::get('/custom-fields', [\App\Http\Controllers\Api\CustomFieldController::class, 'index'])->name('custom.field');
    Route::post('/upload-file', [\App\Http\Controllers\Api\CustomFieldController::class, 'upload'])->name('upload.file');
    Route::post('/store-custom-field-values', [\App\Http\Controllers\Api\CustomFieldController::class, 'storeValues'])->name('store.custom.field.values');
});