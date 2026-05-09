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
}
