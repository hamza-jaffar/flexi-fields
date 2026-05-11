<?php

namespace App\Http\Controllers\Shopify;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index(Request $request)
    {
        $shop = $request->get('shop_instance');

        return Inertia::render('frontend/settings/index', [
            'settings' => [
                'summary_label' => $shop->summary_label,
                'required_error_label' => $shop->required_error_label,
                'addon_product_name' => $shop->addon_product_name,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $shop = $request->get('shop_instance');

        $validated = $request->validate([
            'summary_label' => 'required|string|max:255',
            'required_error_label' => 'required|string|max:255',
            'addon_product_name' => 'required|string|max:255',
        ]);

        $shop->update($validated);

        return back()->with('success', 'Settings updated successfully!');
    }
}
