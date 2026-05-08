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
        $params = $request->query();
        $hmac = $request->query('hmac');
        $shopDomain = $request->query('shop');

        if (! $shopDomain) {
            return response()->json([
                'error' => 'Missing shop parameter. Please launch the app from Shopify.',
            ], 400);
        }

        // 1. If there's no HMAC, it's not a valid Shopify request
        if (!$hmac) {
            return response()->json(['error' => 'Unauthorized source.'], 401);
        }

        // 2. Remove HMAC from the parameters to calculate the signature
        unset($params['hmac']);

        // 3. Sort parameters lexicographically by key
        ksort($params);

        // 4. Form the message string (key=value&key2=value2...)
        $pairs = [];
        foreach ($params as $key => $value) {
            $pairs[] = "$key=$value";
        }
        $message = implode('&', $pairs);

        // 5. Hash the message with your App Secret
        $calculatedHmac = hash_hmac('sha256', $message, config('shopify.api_secret'));

        // 6. Compare with the HMAC provided in the request
        if (!hash_equals($hmac, $calculatedHmac)) {
            return response()->json(['error' => 'Invalid signature.'], 401);
        }

        $shop = Shop::where('shop_domain', $shopDomain)->first();

        if (! $shop) {
            return redirect()->route('auth', $request->query());
        }

        return $next($request);
    }
}
