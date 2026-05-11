<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\CustomField;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\PlanFeature;
use App\Services\ShopifyService;

class CustomFieldController extends Controller
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

        return [
            'limit' => $limit,
            'current' => $currentCount,
        ];
    }

    public function index(Request $request)
    {
        $shop = $this->getShop($request);
        
        $customFields = CustomField::where('shop_id', $shop->id)
            ->with('targets')
            ->orderBy('sort_order')
            ->get();

        $stats = $this->getFieldStats($shop);
        ShopifyService::ensureAddonProductExists($shop);

        return Inertia::render('frontend/custom-fields/index', [
            'customFields' => $customFields,
            'allFields' => $customFields, // All fields for index as well if needed
            'shop' => $shop,
            'fieldStats' => $stats,
        ]);
    }

    public function create(Request $request)
    {
        $shop = $this->getShop($request);
        $stats = $this->getFieldStats($shop);
        ShopifyService::ensureAddonProductExists($shop);

        if ($stats['limit'] !== -1 && $stats['current'] >= $stats['limit']) {
            return redirect()->route('app.custom-field.index')->with('error', 'You have reached your custom fields limit. Please upgrade your plan or delete fields to continue.');
        }
        
        $allFields = CustomField::where('shop_id', $shop->id)->get();

        return Inertia::render('frontend/custom-fields/create', [
            'shop' => $shop,
            'allFields' => $allFields,
        ]);
    }

    public function store(Request $request)
    {
        $shop = $this->getShop($request);
        $stats = $this->getFieldStats($shop);

        if ($stats['limit'] !== -1 && $stats['current'] >= $stats['limit']) {
            return redirect()->route('app.custom-field.index')->with('error', 'You have reached your custom fields limit.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:custom_fields,slug,NULL,id,shop_id,' . $shop->id,
            'type' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'is_required' => 'boolean',
            'min_length' => 'nullable|integer',
            'max_length' => 'nullable|integer',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
            'has_price_addon' => 'boolean',
            'price' => 'nullable|numeric',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
            'settings' => 'nullable|array',
            'conditions' => 'nullable|array',
            'target' => 'required|in:product,collection,tag,cart,checkout',
            'target_ids' => 'nullable|array', // e.g. ["gid://shopify/Product/123", "gid://shopify/Product/456"]
        ]);

        $validated['shop_id'] = $shop->id;

        $customField = CustomField::create($validated);

        if (!empty($validated['target_ids'])) {
            foreach ($validated['target_ids'] as $targetId) {
                $customField->targets()->create(['target_id' => $targetId]);
            }
        }

        return redirect()->route('app.custom-field.index')->with('success', 'Custom field created successfully.');
    }

    public function edit(Request $request, CustomField $customField)
    {
        $shop = $this->getShop($request);
        ShopifyService::ensureAddonProductExists($shop);
        
        if ($customField->shop_id !== $shop->id) {
            abort(403);
        }

        $allFields = CustomField::where('shop_id', $shop->id)
            ->where('id', '!=', $customField->id)
            ->get();

        return Inertia::render('frontend/custom-fields/edit', [
            'shop' => $shop,
            'customField' => $customField->load('targets'),
            'allFields' => $allFields,
        ]);
    }

    public function update(Request $request, CustomField $customField)
    {
        $shop = $this->getShop($request);

        if ($customField->shop_id !== $shop->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:custom_fields,slug,' . $customField->id . ',id,shop_id,' . $shop->id,
            'type' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'is_required' => 'boolean',
            'min_length' => 'nullable|integer',
            'max_length' => 'nullable|integer',
            'min_value' => 'nullable|numeric',
            'max_value' => 'nullable|numeric',
            'has_price_addon' => 'boolean',
            'price' => 'nullable|numeric',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
            'settings' => 'nullable|array',
            'conditions' => 'nullable|array',
            'target' => 'required|in:product,collection,tag,cart,checkout',
            'target_ids' => 'nullable|array',
        ]);

        $customField->update($validated);

        if (isset($validated['target_ids'])) {
            $customField->targets()->delete();
            foreach ($validated['target_ids'] as $targetId) {
                $customField->targets()->create(['target_id' => $targetId]);
            }
        }

        return redirect()->route('app.custom-field.index')->with('success', 'Custom field updated successfully.');
    }

    public function destroy(Request $request, CustomField $customField)
    {
        $shop = $this->getShop($request);

        if ($customField->shop_id !== $shop->id) {
            abort(403);
        }

        $customField->delete();

        return redirect()->route('app.custom-field.index')->with('success', 'Custom field deleted successfully.');
    }

    public function bulkDestroy(Request $request)
    {
        $shop = $this->getShop($request);

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        CustomField::where('shop_id', $shop->id)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return redirect()->route('app.custom-field.index')->with('success', 'Custom fields deleted successfully.');
    }
}
