<?php

namespace App\Http\Middleware;

use App\Models\Shop;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyShopifySessionToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization');

        if ($header && str_starts_with($header, 'Bearer ')) {
            $token = str_replace('Bearer ', '', $header);
            return $this->verifyToken($request, $next, $token);
        }

        if ($request->header('X-Inertia') || $request->ajax()) {
            // For Inertia, we return a 401 status. 
            // We avoid sending a JSON body here because Inertia expects an Inertia-formatted JSON if any body is present.
            return response('', 401)->header('X-Inertia-Location', $request->fullUrl());
        }

        $shopDomain = session('shopify_shop') ?: $request->query('shop');

        if (!$shopDomain) {
             return response('Missing shop parameter.', 400);
        }

        $shop = Shop::where('shop_domain', $shopDomain)->first();

        if (!$shop) {
             return redirect()->route('auth', ['shop' => $shopDomain]);
        }

        $request->merge(['shop_instance' => $shop]);
        session(['shopify_shop' => $shopDomain]);

        return $next($request);
    }

    private function verifyToken(Request $request, Closure $next, string $token)
    {
        try {
            $apiSecret = config('shopify.api_secret');
            $decoded = JWT::decode($token, new Key($apiSecret, 'HS256'));
            $shopDomain = parse_url($decoded->dest, PHP_URL_HOST);

            $shop = Shop::where('shop_domain', $shopDomain)->first();

            if (!$shop) {
                return response('', 401);
            }

            $request->merge(['shop_instance' => $shop]);
            session(['shopify_shop' => $shopDomain]);

            return $next($request);
        } catch (\Exception $e) {
            return response('', 401);
        }
    }
}
