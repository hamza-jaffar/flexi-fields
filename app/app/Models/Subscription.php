<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(
    'shop_id',
    'plan_id',
    'charge_id',
    'status',
    'name',
    'price',
    'currency',
    'billing_interval',
    'trial_days',
    'billing_on',
    'activated_on',
    'cancelled_on',
    'test'
)]
class Subscription extends Model
{
    /**
     * Get the shop that owns the subscription.
     */
    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the plan associated with the subscription.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Scope a query to only include active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }
}
