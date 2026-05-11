<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(
    'shop_domain',
    'name',
    'access_token',
    'refresh_token',
    'access_token_expires_at',
    'refresh_token_expires_at',
    'token_mode',
    'scopes',
    'shop_owner_email',
    'installed_at',
    'uninstalled_at',
    'last_synced_at',
    'credits',
    'addon_variant_id',
    'storage_used',
    'summary_label',
    'required_error_label',
    'addon_product_name'
)]
class Shop extends Model
{
    /**
     * Get the active subscription for the shop.
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'ACTIVE');
    }

    /**
     * Get all subscriptions for the shop.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
