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
        Schema::create('shops', function (Blueprint $table) {
            $table->id();

            // Required identifiers
            $table->string('shop_domain')->unique(); // example-store.myshopify.com
            $table->string('name')->nullable();

            // Auth: offline/online access token + refresh token
            $table->string('access_token')->nullable();
            $table->string('refresh_token')->nullable();
            $table->timestamp('access_token_expires_at')->nullable();
            $table->timestamp('refresh_token_expires_at')->nullable();

            // Optional: track which mode we are using, for debugging/migration
            // e.g. 'offline_nonexpiring', 'offline_expiring', 'client_credentials'
            $table->string('token_mode')->nullable();

            $table->text('scopes')->nullable(); // e.g. "write_products,read_orders"

            // Shop metadata
            $table->string('shop_owner_email')->nullable();

            // Lifecycle
            $table->timestamp('installed_at')->nullable();
            $table->timestamp('uninstalled_at')->nullable();

            // Sync bookkeeping
            $table->timestamp('last_synced_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
