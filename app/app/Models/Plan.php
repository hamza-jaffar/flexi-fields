<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(
    'name',
    'handle',
    'price',
    'discounted_price',
    'currency',
    'billing_interval',
    'trial_days',
    'is_active',
    'is_featured',
    'internal_features',
    'display_features',
    'button_text',
)]
class Plan extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'discounted_price' => 'decimal:2',
        'trial_days' => 'integer',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'internal_features' => 'array',
        'display_features' => 'array',
    ];

    /**
     * Scope a query to only include active plans.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
