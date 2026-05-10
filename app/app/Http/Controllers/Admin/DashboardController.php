<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\Subscription;
use App\Models\CustomField;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalShops = Shop::count();
        $activeShops = Subscription::active()->count();
        $totalFields = CustomField::count();
        $monthlyRevenue = Subscription::active()
            ->where('billing_interval', 'EVERY_30_DAYS')
            ->sum('price');
        
        $yearlyRevenue = Subscription::active()
            ->where('billing_interval', 'EVERY_12_MONTHS')
            ->sum('price');

        $recentShops = Shop::with('subscription.plan')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_shops' => $totalShops,
                'active_subscriptions' => $activeShops,
                'total_fields' => $totalFields,
                'monthly_revenue' => $monthlyRevenue,
                'yearly_revenue' => $yearlyRevenue,
                'retention_rate' => $totalShops > 0 ? round(($activeShops / $totalShops) * 100, 1) : 0,
            ],
            'recentShops' => $recentShops,
        ]);
    }
}
