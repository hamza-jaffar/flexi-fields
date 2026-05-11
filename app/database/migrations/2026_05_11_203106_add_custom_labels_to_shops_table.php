<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->string('summary_label')->default('Price add-ons');
            $table->string('required_error_label')->default('is required');
            $table->string('addon_product_name')->default('Flexi Fields Addon');
        });
    }

    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn(['summary_label', 'required_error_label', 'addon_product_name']);
        });
    }
};
