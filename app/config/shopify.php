<?php

return [
    "api_key" => env("SHOPIFY_API_KEY"),
    "api_secret" => env("SHOPIFY_API_SECRET"),
    "scopes" => explode(",", env("SHOPIFY_SCOPES", "")),
    "redirect_url" => env("SHOPIFY_REDIRECT_URL"),
];