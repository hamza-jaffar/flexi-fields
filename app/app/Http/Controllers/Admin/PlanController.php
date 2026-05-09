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
    public function index()
    {
        return Inertia::render('admin/plan/index', [
            'plans' => PlanService::getAllPlans(),
        ]);
    }

    /**
     * Show the form for creating a new plan.
     */
    public function create()
    {
        return Inertia::render('admin/plan/create');
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
            'plan' => $plan
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
