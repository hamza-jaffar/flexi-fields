<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyShopifyRequest
{
    /**
     * Verifies that the incoming request is an authentic Shopify request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $shopDomain = $request->query('shop');
        $hmac = $request->query('hmac');

        // 1. If we have both shop and hmac, verify the signature and store in session
        if ($shopDomain && $hmac) {
            if ($this->verifyHmac($request->query())) {
                session(['shopify_shop' => $shopDomain]);
            } else {
                return response()->json(['error' => 'Invalid signature.'], 401);
            }
        }

        // 2. If shop is missing from query, try to get it from session
        if (!$shopDomain) {
            $shopDomain = session('shopify_shop');
        }

        // 3. If we still don't have a shop, it's an invalid request
        if (!$shopDomain) {
            return response()->json([
                'error' => 'Missing shop parameter. Please launch the app from Shopify.',
            ], 400);
        }

        // 4. Verify the shop exists in our database
        $shop = Shop::where('shop_domain', $shopDomain)->first();

        if (!$shop) {
            // If the shop is not in our database or uninstalled, we need to authenticate
            return redirect()->route('auth', ['shop' => $shopDomain]);
        }

        $request->attributes->set('shop_instance', $shop);

        return $next($request);
    }

    /**
     * Security Helper: HMAC Verification
     */
    private function verifyHmac(array $params): bool
    {
        $hmac = $params['hmac'] ?? '';
        unset($params['hmac']);

        // Alphabetical sort of keys is mandatory for HMAC calculation
        ksort($params);

        $pairs = [];
        foreach ($params as $key => $value) {
            $pairs[] = "$key=$value";
        }
        $message = implode('&', $pairs);

        $calculatedHmac = hash_hmac('sha256', $message, config('shopify.api_secret'));

        return hash_equals($hmac, $calculatedHmac);
    }
}
