<?php

namespace App\Http\Controllers\Shopify;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleUninstall(Request $request)
    {
        $domain = $request->header('X-Shopify-Shop-Domain');
        
        Log::info("Uninstall webhook received for {$domain}");

        // Find the shop and mark as uninstalled
        $shop = Shop::where('shop_domain', $domain)->first();

        if ($shop) {
            $shop->update([
                'uninstalled_at' => now(),
                'access_token' => null, // Clear token as it's no longer valid
            ]);
            Log::info("Shop {$domain} marked as uninstalled.");
        }

        return response()->json(['message' => 'Webhook processed'], 200);
    }

    /**
     * Middleware-like check for Shopify Webhook signatures could go here
     * or in a dedicated middleware.
     */
}
