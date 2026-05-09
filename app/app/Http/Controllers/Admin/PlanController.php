<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\PlanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Display a listing of the plans.
     */
    public function index(Request $request)
    {
        $query = Plan::query();

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('handle', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        
        $allowedSortFields = ['id', 'name', 'handle', 'price', 'is_active', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate
        $plans = $query->paginate($request->get('per_page', 10))->withQueryString();

        return Inertia::render('admin/plan/index', [
            'plans' => $plans,
            'filters' => $request->only(['search', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new plan.
     */
    public function create()
    {
        return Inertia::render('admin/plan/create', [
            'groupedFeatures' => \App\Enums\PlanFeature::groupedFeatures(),
        ]);
    }

    /**
     * Store a newly created plan in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'handle' => 'required|string|max:255|unique:plans,handle',
            'price' => 'required|numeric|min:0',
            'discounted_price' => 'nullable|numeric|min:0',
            'currency' => 'required|string|size:3',
            'billing_interval' => 'required|string',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'internal_features' => 'required|array',
            'display_features' => 'nullable|array',
            'button_text' => 'required|string|max:255',
        ]);

        PlanService::createPlan($validated);

        return redirect()->route('plan.index')->with('success', 'Plan created successfully.');
    }

    /**
     * Show the form for editing the specified plan.
     */
    public function edit(Plan $plan)
    {
        return Inertia::render('admin/plan/edit', [
            'plan' => $plan,
            'groupedFeatures' => \App\Enums\PlanFeature::groupedFeatures(),
        ]);
    }

    /**
     * Update the specified plan in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'handle' => 'required|string|max:255|unique:plans,handle,' . $plan->id,
            'price' => 'required|numeric|min:0',
            'discounted_price' => 'nullable|numeric|min:0',
            'currency' => 'required|string|size:3',
            'billing_interval' => 'required|string',
            'trial_days' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'internal_features' => 'required|array',
            'display_features' => 'nullable|array',
            'button_text' => 'required|string|max:255',
        ]);

        PlanService::updatePlan($plan, $validated);

        return redirect()->route('plan.index')->with('success', 'Plan updated successfully.');
    }

    /**
     * Remove the specified plan from storage.
     */
    public function destroy(Plan $plan)
    {
        PlanService::deletePlan($plan);

        return redirect()->route('plan.index')->with('success', 'Plan deleted successfully.');
    }
}
