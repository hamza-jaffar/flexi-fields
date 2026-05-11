<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Shop;
use App\Services\PlanService;
use App\Enums\PlanFeature;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $shop = $request->attributes->get('shop_instance');

        $media = Media::where('shop_id', $shop->id)
            ->latest()
            ->paginate(24);

        $storageUsed = $shop->storage_used;
        $storageLimitMb = PlanService::resolveFeatureValue($shop, PlanFeature::STORAGE_LIMIT_MB->value, 100);

        return Inertia::render('frontend/media/index', [
            'media' => $media,
            'shop' => $shop,
            'stats' => [
                'used_bytes' => $storageUsed,
                'limit_mb' => $storageLimitMb,
                'percentage' => $storageLimitMb > 0 ? min(100, round(($storageUsed / ($storageLimitMb * 1024 * 1024)) * 100, 2)) : ($storageLimitMb === -1 ? 0 : 100),
            ]
        ]);
    }

    public function destroy(Request $request, Media $media)
    {
        $shop = $request->attributes->get('shop_instance');

        if ($media->shop_id !== $shop->id) {
            abort(403);
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        // Decrement storage used
        $shop->decrement('storage_used', $media->file_size);

        $media->delete();

        return redirect()->back()->with('success', 'File deleted successfully');
    }
}
