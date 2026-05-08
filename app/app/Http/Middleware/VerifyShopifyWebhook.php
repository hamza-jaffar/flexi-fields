<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class VerifyShopifyWebhook
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $hmac = $request->header('X-Shopify-Hmac-Sha256');
        $data = $request->getContent();
        $secret = config('shopify.api_secret');

        $calculatedHmac = base64_encode(hash_hmac('sha256', $data, $secret, true));

        if (!hash_equals($hmac, $calculatedHmac)) {
            Log::warning('Shopify webhook verification failed.');
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }

        return $next($request);
    }
}
