<?php

namespace App\Services;

use App\Models\Plan;
use Illuminate\Support\Collection;

class PlanService
{
    /**
     * Get all plans.
     */
    public static function getAllPlans(): Collection
    {
        return Plan::latest()->get();
    }

    /**
     * Get active plans for the frontend.
     */
    public static function getActivePlans(): Collection
    {
        return Plan::active()->get();
    }

    /**
     * Create a new plan.
     */
    public static function createPlan(array $data): Plan
    {
        return Plan::create($data);
    }

    /**
     * Update an existing plan.
     */
    public static function updatePlan(Plan $plan, array $data): Plan
    {
        $plan->update($data);
        return $plan;
    }

    /**
     * Delete a plan.
     */
    public static function deletePlan(Plan $plan): bool
    {
        return $plan->delete();
    }
}
