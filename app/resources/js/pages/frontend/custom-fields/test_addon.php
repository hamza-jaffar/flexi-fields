<?php

use App\Models\Shop;
use App\Services\ShopifyService;
use Illuminate\Support\Facades\Log;

$shop = Shop::first();

if (!$shop) {
    echo "No shop found in database.\n";
    exit;
}

echo "Checking Product Status for shop: {$shop->shop_domain}\n";

$query = <<<GQL
query {
  products(first: 1, query: "title:'Flexi Fields Addon'") {
    edges {
      node {
        id
        title
        status
        totalVariants
      }
    }
  }
}
GQL;

$result = ShopifyService::graphQL($shop, $query);
echo "Result: " . json_encode($result) . "\n";
