<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing plans to avoid duplicates
        Plan::truncate();

        $plans = [
            [
                'name' => 'Rookie',
                'handle' => 'rookie',
                'price' => 0.00,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 0,
                'is_active' => true,
                'is_featured' => false,
                'internal_features' => [
                    'basic_editor' => true,
                    'metaobjects_editor' => true,
                    'excel_editor' => false,
                    'theme_ext' => false,
                    'browser_ext' => false,
                    'definitions' => false,
                    'sets_limit' => '—',
                ],
                'display_features' => ['Basic metafields editor', 'Metaobjects editor'],
            ],
            [
                'name' => 'Adept',
                'handle' => 'adept',
                'price' => 9.00,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 7,
                'is_active' => true,
                'is_featured' => false,
                'internal_features' => [
                    'basic_editor' => true,
                    'metaobjects_editor' => true,
                    'excel_editor' => true,
                    'theme_ext' => true,
                    'browser_ext' => true,
                    'definitions' => true,
                    'sets_limit' => '10 metafield sets',
                ],
                'display_features' => ['Excel-like editor', 'Theme extensions', '10 metafield sets'],
            ],
            [
                'name' => 'Guru',
                'handle' => 'guru',
                'price' => 19.00,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 7,
                'is_active' => true,
                'is_featured' => true,
                'internal_features' => [
                    'basic_editor' => true,
                    'metaobjects_editor' => true,
                    'excel_editor' => true,
                    'theme_ext' => true,
                    'browser_ext' => true,
                    'definitions' => true,
                    'sets_limit' => '20 metafield sets',
                ],
                'display_features' => ['Everything in Adept', '20 metafield sets', 'Priority support'],
            ],
            [
                'name' => 'Guru Plus',
                'handle' => 'guru_plus',
                'price' => 59.00,
                'billing_interval' => 'EVERY_30_DAYS',
                'trial_days' => 7,
                'is_active' => true,
                'is_featured' => false,
                'internal_features' => [
                    'basic_editor' => true,
                    'metaobjects_editor' => true,
                    'excel_editor' => true,
                    'theme_ext' => true,
                    'browser_ext' => true,
                    'definitions' => true,
                    'sets_limit' => '50 metafield sets',
                ],
                'display_features' => ['Everything in Guru', '50 metafield sets', 'Dedicated account manager'],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}
