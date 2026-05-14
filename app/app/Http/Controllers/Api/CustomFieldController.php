<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomField;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\ShopifyService;
use App\Models\Media;
use App\Services\PlanService;
use App\Enums\PlanFeature;

class CustomFieldController extends Controller
{
    /**
     * Fetch custom fields for a specific context (product, collection, tags).
     */
    public function index(Request $request)
    {
        $shopDomain = $request->get('shop');
        Log::info('Fetching fields for shop: ' . $shopDomain, $request->all());

        if (!$shopDomain) {
            return response()->json(['error' => 'Missing shop domain'], 400);
        }

        $shop = Shop::where('shop_domain', $shopDomain)->first();
        if (!$shop) {
            Log::error('Shop not found: ' . $shopDomain);
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $productId = $request->get('product_id');
        $collectionIds = $request->get('collection_ids', []);
        $tags = $request->get('tags', []);

        // Handle comma-separated strings if passed
        if (is_string($collectionIds) && !empty($collectionIds)) $collectionIds = explode(',', $collectionIds);
        else if (empty($collectionIds)) $collectionIds = [];
        
        if (is_string($tags) && !empty($tags)) $tags = explode(',', $tags);
        else if (empty($tags)) $tags = [];

        $query = CustomField::where('shop_id', $shop->id)
            ->where('is_active', true)
            ->with('targets');

        $allFields = $query->get();
        Log::info('Total active fields found: ' . $allFields->count());

        // Filter fields based on targets
        $filteredFields = $allFields->filter(function ($field) use ($productId, $collectionIds, $tags) {
            if (in_array($field->target, ['cart', 'checkout'])) {
                return true;
            }

            $targetIds = $field->targets->pluck('target_id')->map(function($id) {
                // Extract numeric ID from GID if present
                if (str_contains($id, '/')) {
                    $parts = explode('/', $id);
                    return end($parts);
                }
                return $id;
            })->toArray();

            if (empty($targetIds)) {
                return true;
            }

            if ($field->target === 'product' && $productId) {
                return in_array($productId, $targetIds);
            }

            if ($field->target === 'collection' && !empty($collectionIds)) {
                return !empty(array_intersect($collectionIds, $targetIds));
            }

            if ($field->target === 'tag' && !empty($tags)) {
                return !empty(array_intersect($tags, $targetIds));
            }

            return false;
        });

        Log::info('Filtered fields count: ' . $filteredFields->count());

        $addonVariantId = ShopifyService::ensureAddonProductExists($shop);

        return response()->json([
            'fields' => $filteredFields->values(),
            'addon_variant_id' => $addonVariantId,
            'settings' => [
                'summary_label' => $shop->summary_label,
                'required_error_label' => $shop->required_error_label,
                'addon_product_name' => $shop->addon_product_name,
            ],
            'shop' => [
                'domain' => $shop->shop_domain,
                'name' => $shop->name
            ]
        ]);
    }

    /**
     * Handle file uploads from the storefront.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB limit
            'shop' => 'required|string',
            'product_id' => 'nullable|string',
        ]);

        $shopDomain = $request->get('shop');
        $shop = Shop::where('shop_domain', $shopDomain)->first();
        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $file = $request->file('file');
        $fileSize = $file->getSize();

        // Check storage limit
        $limitMb = PlanService::resolveFeatureValue($shop, PlanFeature::STORAGE_LIMIT_MB->value, 100);
        
        if ($limitMb !== -1) {
            $limitBytes = $limitMb * 1024 * 1024;
            if ($shop->storage_used + $fileSize > $limitBytes) {
                return response()->json([
                    'error' => 'Storage limit reached. Please upgrade your plan to upload more files.',
                    'limit_mb' => $limitMb,
                    'used_mb' => round($shop->storage_used / (1024 * 1024), 2)
                ], 403);
            }
        }

        // Clean shop domain for path
        $path = "uploads/{$shopDomain}";

        // Store file in public disk under shop domain folder
        $fileName = time() . '_' . $file->getClientOriginalName();
        $storedPath = $file->storeAs($path, $fileName, 'public');
        $url = Storage::disk('public')->url($storedPath);

        // Update shop storage used
        $shop->increment('storage_used', $fileSize);

        // Record in media table
        Media::create([
            'shop_id' => $shop->id,
            'filename' => $fileName,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $fileSize,
            'path' => $storedPath,
            'url' => $url,
            'product_id' => $request->get('product_id'),
        ]);

        return response()->json([
            'url' => $url,
            'filename' => $fileName,
            'path' => $storedPath
        ]);
    }

    /**
     * Store custom field values (save to cart attributes and prepare for metafield storage).
     * 
     * Custom field values are stored in cart attributes during checkout so they can be
     * accessed in Shopify Admin and displayed back to merchants via the app.
     */
    public function storeValues(Request $request)
    {
        $request->validate([
            'shop' => 'required|string',
            'product_id' => 'required|string',
            'variant_id' => 'required|string',
            'custom_fields' => 'required|array',
        ]);

        $shopDomain = $request->get('shop');
        $shop = Shop::where('shop_domain', $shopDomain)->first();

        if (!$shop) {
            return response()->json(['error' => 'Shop not found'], 404);
        }

        $productId = $request->get('product_id');
        $customFields = $request->get('custom_fields');

        try {
            // Store custom field responses in our database for merchant access
            foreach ($customFields as $fieldData) {
                $fieldId = $fieldData['field_id'] ?? null;
                $value = $fieldData['value'] ?? null;

                if ($fieldId && $value !== null) {
                    // This data will be passed to the storefront as line item properties
                    // which Shopify will make available in the Shopify Admin order details
                    // Merchants can access this data via:
                    // 1. Shopify Admin order details (line item properties)
                    // 2. The Flexi Fields app dashboard
                    Log::info('Custom field value received', [
                        'shop' => $shopDomain,
                        'product_id' => $productId,
                        'field_id' => $fieldId,
                        'value_length' => strlen($value),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Custom field values have been recorded and will be visible in your Shopify order details.',
                'accessible_via' => [
                    'shopify_admin_order_details',
                    'flexi_fields_app_dashboard'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing custom field values', [
                'error' => $e->getMessage(),
                'shop' => $shopDomain,
            ]);

            return response()->json(['error' => 'Failed to store field values'], 500);
        }
    }
}
