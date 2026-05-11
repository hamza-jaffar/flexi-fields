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

        // Always allow Shopify Admin to frame the app
        $csp = "frame-ancestors https://admin.shopify.com https://*.myshopify.com";
        
        if ($shop) {
            $csp .= " https://{$shop}";
        }

        $response->headers->set('Content-Security-Policy', $csp . ";");

        // Force removal of X-Frame-Options to allow iFrame loading
        $response->headers->remove('X-Frame-Options');
        
        // Some servers/middlewares might re-add it, so we ensure it's gone
        if (method_exists($response, 'header')) {
            $response->header('X-Frame-Options', null);
        }

        return $response;
    }
}
