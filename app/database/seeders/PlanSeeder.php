<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use App\Enums\PlanFeature;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing plans to avoid duplicates
        \Illuminate\Support\Facades\DB::table('plans')->delete();

        $plans = [
            [
                'name' => 'Free',
                'handle' => 'free',
                'price' => 0.00,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 0,
                'is_active' => true,
                'is_featured' => false,
                'internal_features' => [
                    ['feature_key' => PlanFeature::CUSTOM_FIELDS_LIMIT->value, 'feature_value' => 5],
                    ['feature_key' => PlanFeature::BASIC_FIELD_TYPES->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::FIELD_VALIDATION->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::STORAGE_LIMIT_MB->value, 'feature_value' => 50],
                ],
                'display_features' => ['Up to 5 custom fields', 'Standard field types', 'Quick setup'],
            ],
            [
                'name' => 'Basic',
                'handle' => 'basic',
                'price' => 9.99,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 7,
                'is_active' => true,
                'is_featured' => false,
                'internal_features' => [
                    ['feature_key' => PlanFeature::CUSTOM_FIELDS_LIMIT->value, 'feature_value' => 20],
                    ['feature_key' => PlanFeature::BASIC_FIELD_TYPES->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::FIELD_VALIDATION->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::CONDITIONAL_LOGIC->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::BULK_EDITOR->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::STORAGE_LIMIT_MB->value, 'feature_value' => 250],
                ],
                'display_features' => ['Up to 20 custom fields', 'Conditional logic', 'Bulk editor tools', '7-day free trial'],
            ],
            [
                'name' => 'Pro',
                'handle' => 'pro',
                'price' => 24.99,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 7,
                'is_active' => true,
                'is_featured' => true,
                'internal_features' => [
                    ['feature_key' => PlanFeature::CUSTOM_FIELDS_LIMIT->value, 'feature_value' => 100],
                    ['feature_key' => PlanFeature::BASIC_FIELD_TYPES->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::ADVANCED_FIELD_TYPES->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::FIELD_VALIDATION->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::CONDITIONAL_LOGIC->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::BULK_EDITOR->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::FILE_UPLOADS->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::PRICE_ADDONS->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::PRIORITY_SUPPORT->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::STORAGE_LIMIT_MB->value, 'feature_value' => 1000],
                ],
                'display_features' => ['Up to 100 custom fields', 'File uploads & Price add-ons', 'Advanced field types', 'Priority support'],
            ],
            [
                'name' => 'Enterprise',
                'handle' => 'enterprise',
                'price' => 59.99,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 7,
                'is_active' => true,
                'is_featured' => false,
                'internal_features' => [
                    ['feature_key' => PlanFeature::CUSTOM_FIELDS_LIMIT->value, 'feature_value' => -1],
                    ['feature_key' => PlanFeature::BASIC_FIELD_TYPES->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::ADVANCED_FIELD_TYPES->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::FIELD_VALIDATION->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::CONDITIONAL_LOGIC->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::BULK_EDITOR->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::FILE_UPLOADS->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::PRICE_ADDONS->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::PRIORITY_SUPPORT->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::CUSTOM_STYLING->value, 'feature_value' => true],
                    ['feature_key' => PlanFeature::STORAGE_LIMIT_MB->value, 'feature_value' => -1],
                ],
                'display_features' => ['Unlimited custom fields', 'Custom styling support', 'White-glove setup', 'Priority support'],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}
