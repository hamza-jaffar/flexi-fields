<?php

namespace App\Services;

use App\Models\Shop;
use App\Models\Plan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopifyService
{
    /**
     * Execute a GraphQL query against the Shopify API.
     */
    public static function graphQL(Shop $shop, string $query, array $variables = [])
    {
        $apiVersion = config('shopify.api_version');
        $url = "https://{$shop->shop_domain}/admin/api/{$apiVersion}/graphql.json";

        $payload = ['query' => $query];
        
        if (!empty($variables)) {
            $payload['variables'] = $variables;
        }

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $shop->access_token,
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        if ($response->failed()) {
            Log::error("Shopify GraphQL Error for {$shop->shop_domain}", [
                'body' => $response->body(),
                'query' => $query,
            ]);
            return null;
        }

        return $response->json();
    }

    /**
     * Create a new app subscription for a shop.
     */
    public static function createSubscription(Shop $shop, Plan $plan)
    {
        $query = <<<GQL
        mutation appSubscriptionCreate(\$name: String!, \$lineItems: [AppSubscriptionLineItemInput!]!, \$returnUrl: URL!, \$trialDays: Int, \$test: Boolean) {
          appSubscriptionCreate(name: \$name, lineItems: \$lineItems, returnUrl: \$returnUrl, trialDays: \$trialDays, test: \$test) {
            confirmationUrl
            appSubscription {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
        GQL;

        $variables = [
            'name' => $plan->name,
            'returnUrl' => route('app.billing.callback', ['plan_id' => $plan->id, 'shop' => $shop->shop_domain]),
            'trialDays' => $plan->trial_days,
            'test' => true, // Force test mode for development. Change to false for production.
            'lineItems' => [
                [
                    'plan' => [
                        'appRecurringPricingDetails' => [
                            'price' => [
                                'amount' => (float) ($plan->discounted_price ?? $plan->price),
                                'currencyCode' => 'USD',
                            ],
                            'interval' => $plan->billing_interval === 'EVERY_30_DAYS' ? 'EVERY_30_DAYS' : 'ANNUAL',
                        ],
                    ],
                ],
            ],
        ];

        $result = self::graphQL($shop, $query, $variables);

        if (!$result || isset($result['errors'])) {
            Log::error("Shopify GraphQL Error for {$shop->shop_domain}", [
                'errors' => $result['errors'] ?? 'Unknown GraphQL Error',
                'variables' => $variables
            ]);
            return null;
        }

        $data = $result['data']['appSubscriptionCreate'];

        if (!empty($data['userErrors'])) {
            Log::error("Subscription user errors for {$shop->shop_domain}", [
                'errors' => $data['userErrors'],
                'variables' => $variables
            ]);
            return null;
        }

        return $data;
    }

    /**
     * Get active subscription details from Shopify.
     */
    public static function getActiveSubscription(Shop $shop)
    {
        $query = <<<GQL
        query {
          currentAppInstallation {
            activeSubscriptions {
              id
              name
              status
              test
            }
          }
        }
        GQL;

        $result = self::graphQL($shop, $query);

        Log::info('Raw GraphQL response for activeSubscriptions', [
            'shop' => $shop->shop_domain,
            'result' => $result
        ]);

        if (!$result || !isset($result['data']['currentAppInstallation']['activeSubscriptions'])) {
            return null;
        }

        return $result['data']['currentAppInstallation']['activeSubscriptions'][0] ?? null;
    }

    /**
     * Ensure the hidden addon product exists and return its variant ID.
     */
    public static function ensureAddonProductExists(Shop $shop)
    {
        if ($shop->addon_variant_id) {
            return $shop->addon_variant_id;
        }

        // 1. Search for existing product
        $searchQuery = <<<GQL
        query {
          products(first: 1, query: "title:'Flexi Fields Addon'") {
            edges {
              node {
                id
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
        GQL;

        $searchResult = self::graphQL($shop, $searchQuery);
        $products = $searchResult['data']['products']['edges'] ?? [];

        if (!empty($products)) {
            $variantGid = $products[0]['node']['variants']['edges'][0]['node']['id'];
            $variantId = last(explode('/', $variantGid));
            $shop->update(['addon_variant_id' => $variantId]);
            return $variantId;
        }

        // 2. Create the product if not found
        $createMutation = <<<GQL
        mutation productCreate(\$input: ProductInput!) {
          productCreate(input: \$input) {
            product {
              id
              variants(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
        GQL;

        $variables = [
            'input' => [
                'title' => 'Flexi Fields Addon',
                'descriptionHtml' => 'This is a hidden product used by the Flexi Fields app to handle custom field price addons. Do not delete.',
                'status' => 'ACTIVE',
                'tags' => ['flexi-fields-addon'],
                'metafields' => [
                    [
                        'namespace' => 'seo',
                        'key' => 'hidden',
                        'value' => '1',
                        'type' => 'number_integer',
                    ]
                ]
            ]
        ];

        $createResult = self::graphQL($shop, $createMutation, $variables);
        
        if (isset($createResult['data']['productCreate']['product'])) {
            $variantGid = $createResult['data']['productCreate']['product']['variants']['edges'][0]['node']['id'];
            $variantId = last(explode('/', $variantGid));
            
            // 3. Update the variant to have the correct price and settings
            $updateMutation = <<<GQL
            mutation productVariantUpdate(\$input: ProductVariantInput!) {
              productVariantUpdate(input: \$input) {
                productVariant {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
            GQL;

            $updateVariables = [
                'input' => [
                    'id' => $variantGid,
                    'price' => 1.00,
                    'requiresShipping' => false,
                    'inventoryPolicy' => 'CONTINUE',
                    'taxable' => false,
                ]
            ];

            self::graphQL($shop, $updateMutation, $updateVariables);

            $shop->update(['addon_variant_id' => $variantId]);
            return $variantId;
        }

        Log::error("Failed to create addon product for {$shop->shop_domain}", [
            'result' => $createResult
        ]);

        return null;
    }
}
