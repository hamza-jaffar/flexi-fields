<?php

namespace App\Http\Controllers\Shopify;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Mandatory Compliance: Customers Data Request
     * 
     * Shopify sends this webhook when a store owner requests data on behalf of a customer.
     */
    public function customersDataRequest(Request $request)
    {
        $payload = $request->all();
        Log::info('Shopify Compliance: customers/data_request received', $payload);

        // Your logic to collect and provide customer data goes here.
        // For now, we return 200 to satisfy Shopify's check.
        
        return response()->json(['status' => 'acknowledged'], 200);
    }

    /**
     * Mandatory Compliance: Customers Redact
     * 
     * Shopify sends this webhook when a store owner requests that a customer's data be deleted.
     */
    public function customersRedact(Request $request)
    {
        $payload = $request->all();
        Log::info('Shopify Compliance: customers/redact received', $payload);

        // Your logic to delete customer data goes here.
        
        return response()->json(['status' => 'acknowledged'], 200);
    }

    /**
     * Mandatory Compliance: Shop Redact
     * 
     * Shopify sends this webhook 48 hours after a store owner uninstalls your app.
     */
    public function shopRedact(Request $request)
    {
        $payload = $request->all();
        Log::info('Shopify Compliance: shop/redact received', $payload);

        // Your logic to delete shop-related data goes here.
        
        return response()->json(['status' => 'acknowledged'], 200);
    }
    /**
     * Handle app/uninstalled webhook
     */
    public function handleUninstall(Request $request)
    {
        $shopDomain = $request->header('X-Shopify-Shop-Domain');
        Log::info("Shopify Webhook: app/uninstalled received for {$shopDomain}");

        if ($shopDomain) {
            \App\Models\Shop::where('shop_domain', $shopDomain)->update([
                'uninstalled_at' => now(),
                'access_token' => null,
            ]);
        }
        
        return response()->json(['status' => 'acknowledged'], 200);
    }
}
