<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ShopifyHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $shop = $request->query('shop') ?? $request->header('X-Shop-Domain') ?? session('shopify_shop');

        // Explicitly allow Shopify Admin and the store domain
        $ancestors = ['https://admin.shopify.com', 'https://*.myshopify.com'];
        if ($shop) {
            $ancestors[] = "https://{$shop}";
        }

        $csp = "frame-ancestors " . implode(' ', $ancestors) . ";";
        $response->headers->set('Content-Security-Policy', $csp);

        // Remove X-Frame-Options completely. 
        // We do this via the response object AND the PHP global header list.
        $response->headers->remove('X-Frame-Options');
        
        if (function_exists('header_remove')) {
            header_remove('X-Frame-Options');
        }

        return $response;
    }
}
