<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Shop::query()->with('subscription.plan');

            // Search
            if ($request->has('search') && $request->search) {
                $query->where('shop_domain', 'like', '%' . $request->search . '%')
                      ->orWhere('name', 'like', '%' . $request->search . '%')
                      ->orWhere('shop_owner_email', 'like', '%' . $request->search . '%');
            }

            // Sort
            $sortField = $request->get('sort_field', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            
            $allowedSortFields = ['id', 'shop_domain', 'name', 'installed_at', 'created_at', 'credits'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Paginate
            $shops = $query->paginate($request->get('per_page', 10))->withQueryString();

            return Inertia::render('admin/shop/index', [
                'shops' => $shops,
                'filters' => $request->only(['search', 'sort_field', 'sort_direction', 'per_page']),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching shops: ' . $e->getMessage());
            return redirect()
                ->back()
                ->with('error', 'Failed to fetch shops.');
        }
    }
}
