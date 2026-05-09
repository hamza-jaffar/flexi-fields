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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained('shops')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('plans')->onDelete('cascade');
            $table->string('charge_id')->unique(); // Shopify AppSubscription GID
            $table->string('status'); // ACTIVE, DECLINED, EXPIRED, FROZEN, CANCELLED
            $table->string('name'); // Plan name at the time of purchase
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('USD');
            $table->string('billing_interval');
            $table->integer('trial_days')->default(0);
            $table->timestamp('billing_on')->nullable();
            $table->timestamp('activated_on')->nullable();
            $table->timestamp('cancelled_on')->nullable();
            $table->boolean('test')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
