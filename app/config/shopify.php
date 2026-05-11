<?php

return [
    'api_key' => env('SHOPIFY_API_KEY', ''),
    'api_secret' => env('SHOPIFY_API_SECRET', ''),
    'scopes' => env('SHOPIFY_SCOPES', 'read_orders,write_orders,read_products,write_products,read_publications,write_publications'),
    'redirect_uri' => env('SHOPIFY_REDIRECT_URI', env('APP_URL') . '/auth/callback'),
    'api_version' => env('SHOPIFY_API_VERSION', '2024-04'),
];
