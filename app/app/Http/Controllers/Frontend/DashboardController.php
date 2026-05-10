<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\CustomField;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\PlanFeature;

class DashboardController extends Controller
{
    private function getShop(Request $request)
    {
        $shopDomain = $request->get('shop') ?? session('shopify_shop');
        $shop = Shop::where('shop_domain', $shopDomain)->firstOrFail();
        
        $shop->load('subscription.plan');
        if (!$shop->subscription) {
            $freePlan = \App\Models\Plan::where('price', 0)->first();
            if ($freePlan) {
                $shop->setRelation('subscription', new \App\Models\Subscription());
                $shop->subscription->setRelation('plan', $freePlan);
            }
        }
        
        return $shop;
    }

    private function getFieldStats(Shop $shop)
    {
        $plan = $shop->subscription?->plan ?? \App\Models\Plan::where('price', 0)->first();

        $limitFeature = collect($plan->internal_features ?? [])
            ->firstWhere('feature_key', PlanFeature::CUSTOM_FIELDS_LIMIT->value);
            
        $limit = $limitFeature ? (int) $limitFeature['feature_value'] : 10;
        $currentCount = CustomField::where('shop_id', $shop->id)->count();
        $activeCount = CustomField::where('shop_id', $shop->id)->where('is_active', true)->count();

        return [
            'limit' => $limit,
            'current' => $currentCount,
            'active' => $activeCount,
        ];
    }

    public function index(Request $request)
    {
        $shop = $this->getShop($request);
        $stats = $this->getFieldStats($shop);
        
        $recentFields = CustomField::where('shop_id', $shop->id)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('frontend/welcome', [
            'shop' => $shop,
            'stats' => $stats,
            'recentFields' => $recentFields,
        ]);
    }
}
