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
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shop_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('slug')->index();
            $table->string('type');

            $table->text('label');
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();

            $table->boolean('is_required')->default(false);

            $table->integer('min_length')->nullable();
            $table->integer('max_length')->nullable();

            $table->decimal('min_value', 10, 2)->nullable();
            $table->decimal('max_value', 10, 2)->nullable();

            $table->boolean('has_price_addon')->default(false);

            $table->decimal('price', 10, 2)
                ->nullable()
                ->default(0);

            $table->boolean('is_active')->default(true);

            $table->integer('sort_order')
                ->default(0);

            $table->json('options')->nullable();
            $table->json('settings')->nullable();
            $table->json('conditions')->nullable();

            $table->enum('target', ['product', 'collection', 'tag', 'cart', 'checkout'])->default('product');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};
