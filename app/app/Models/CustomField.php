<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(
    'shop_id',
    'name',
    'slug',
    'type',
    'label',
    'placeholder',
    'help_text',
    'is_required',
    'min_length',
    'max_length',
    'min_value',
    'max_value',
    'has_price_addon',
    'price',
    'is_active',
    'sort_order',
    'options',
    'settings',
    'conditions',
    'logic_type',
    'target'
)]
class CustomField extends Model
{
    protected $casts = [
        'is_required' => 'boolean',
        'has_price_addon' => 'boolean',
        'is_active' => 'boolean',
        'options' => 'array',
        'settings' => 'array',
        'conditions' => 'array',
    ];

    public function targets()
    {
        return $this->hasMany(CustomFieldTarget::class);
    }
}
