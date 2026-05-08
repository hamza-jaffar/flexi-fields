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

        $shop = $request->query('shop') ?? $request->header('X-Shop-Domain');

        if ($shop) {
            $response->headers->set('Content-Security-Policy', "frame-ancestors https://{$shop} https://admin.shopify.com;");
        } else {
            $response->headers->set('Content-Security-Policy', "frame-ancestors https://*.myshopify.com https://admin.shopify.com;");
        }

        $response->headers->remove('X-Frame-Options');

        return $response;
    }
}
