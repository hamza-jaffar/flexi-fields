<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('handle')->unique();

            $table->decimal('price', 10, 2);
            $table->decimal('discounted_price', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->enum('billing_interval', ['ONE_TIME', 'EVERY_30_DAYS', 'EVERY_6_MONTHS', 'EVERY_12_MONTHS'])->default('EVERY_30_DAYS');

            $table->integer('trial_days')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);

            $table->json('internal_features');
            $table->json('display_features')->nullable();

            $table->string('button_text')->default('Start Free Trial');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
