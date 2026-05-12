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
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $hmacHeader = $request->header('X-Shopify-Hmac-SHA256');
        
        // Get raw request body before any parsing happens
        $data = $request->getContent();
        
        $secret = config('shopify.api_secret');

        if (empty($hmacHeader)) {
            Log::warning('Shopify Webhook: Missing HMAC header.');
            return response()->json(['error' => 'Missing HMAC header'], 401);
        }

        // Shopify HMAC is Base64 encoded SHA256
        $calculatedHmac = base64_encode(hash_hmac('sha256', $data, $secret, true));

        if (!hash_equals($hmacHeader, $calculatedHmac)) {
            Log::error('Shopify Webhook: HMAC verification failed.', [
                'header' => $hmacHeader,
                'calculated' => $calculatedHmac,
            ]);
            return response()->json(['error' => 'Invalid HMAC signature'], 401);
        }

        return $next($request);
    }
}
