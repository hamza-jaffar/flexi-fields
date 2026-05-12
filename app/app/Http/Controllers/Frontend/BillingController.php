<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Shop;
use App\Models\Subscription;
use App\Services\PlanService;
use App\Services\ShopifyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function __construct(
        protected PlanService $planService
    ) {
    }

    /**
     * Show the billing page with available plans.
     */
    public function index(Request $request)
    {
        $shopDomain = $request->get('shop') ?? session('shopify_shop');
        $shop = Shop::where('shop_domain', $shopDomain)->first();

        if (!$shop) {
            return redirect()->route('app.index', ['shop' => $shopDomain]);
        }

        return Inertia::render('frontend/billing', [
            'plans' => $this->planService->getActivePlans(),
            'current_shop' => [
                'name' => $shop->name ?? 'Store',
                'credits' => $shop->credits ?? 0,
                'domain' => $shopDomain,
                'subscription' => $shop->subscription()->with('plan')->first(),
            ],
        ]);
    }

    /**
     * Start the subscription process.
     */
    public function subscribe(Request $request, Plan $plan)
    {
        $shopDomain = $request->query('shop') ?? session('shopify_shop');

        if ($shopDomain) {
            session(['shopify_shop' => $shopDomain]);
        }

        if (!$shopDomain) {
            return redirect()->back('app.billing')->withErrors(['error' => 'Store domain not found. Please reload the app.']);
        }

        session(['shopify_shop' => $shopDomain]);

        $shop = Shop::where('shop_domain', $shopDomain)->firstOrFail();

        $subscription = ShopifyService::createSubscription($shop, $plan);

        if (!$subscription) {
            return redirect()->back('app.billing', ['shop' => $shopDomain])
                ->withErrors(['error' => 'Failed to initiate subscription with Shopify. Check logs for details.']);
        }

        // Use the redirect view to burst out of the frame properly
        return Inertia::render('frontend/redirect', [
            'authUrl' => $subscription['confirmationUrl']
        ]);
    }

    /**
     * Handle the callback from Shopify after subscription approval.
     */
    public function callback(Request $request)
    {
        $shopDomain = $request->get('shop') ?? session('shopify_shop');
        $chargeId = $request->get('charge_id');
        $planId = $request->get('plan_id');

        Log::info('Subscription callback received', [
            'shop' => $shopDomain,
            'charge_id' => $chargeId,
            'plan_id' => $planId
        ]);

        if (!$shopDomain || !$planId) {
            return redirect()->back('app.billing')->withErrors(['error' => 'Callback parameters missing.']);
        }

        $shop = Shop::where('shop_domain', $shopDomain)->firstOrFail();
        $plan = Plan::findOrFail($planId);

        // Fetch subscription details from Shopify to confirm
        $shopifySubscription = ShopifyService::getActiveSubscription($shop);

        Log::info('Fetched active subscription from Shopify', [
            'shop' => $shopDomain,
            'shopify_subscription' => $shopifySubscription
        ]);

        if (!$shopifySubscription || $shopifySubscription['status'] !== 'ACTIVE') {
            Log::warning('Subscription verification failed', [
                'shop' => $shopDomain,
                'status' => $shopifySubscription['status'] ?? 'null'
            ]);
            return redirect()->back('app.billing', ['shop' => $shopDomain]);
        }

        Log::info('Proceeding to save subscription to database', [
            'shop' => $shopDomain,
            'charge_id' => $chargeId,
            'plan_id' => $plan->id
        ]);

        // Update or create local subscription
        Subscription::updateOrCreate(
            ['charge_id' => $chargeId],
            [
                'shop_id' => $shop->id,
                'plan_id' => $plan->id,
                'status' => 'ACTIVE',
                'name' => $plan->name,
                'price' => (float) ($plan->discounted_price ?? $plan->price),
                'currency' => $plan->currency,
                'billing_interval' => $plan->billing_interval,
                'trial_days' => $plan->trial_days,
                'activated_on' => now(),
                'test' => $shopifySubscription['test'] ?? true,
            ]
        );

        session(['shopify_shop' => $shopDomain]);

        $apiKey = config('shopify.api_key');
        return redirect("https://{$shopDomain}/admin/apps/{$apiKey}/app/billing");
    }
}
