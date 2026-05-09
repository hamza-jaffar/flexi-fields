<?php

namespace App\Enums;

enum PlanFeature: string
{
    /*
    |--------------------------------------------------------------------------
    | Limits
    |--------------------------------------------------------------------------
    */

    case PRODUCTS_LIMIT = 'products_limit';
    case CUSTOM_FIELDS_LIMIT = 'custom_fields_limit';
    case STORAGE_LIMIT_MB = 'storage_limit_mb';

    /*
    |--------------------------------------------------------------------------
    | Field Types
    |--------------------------------------------------------------------------
    */

    case BASIC_FIELD_TYPES = 'basic_field_types';
    case ADVANCED_FIELD_TYPES = 'advanced_field_types';

    /*
    |--------------------------------------------------------------------------
    | Product Customizer Features
    |--------------------------------------------------------------------------
    */

    case CONDITIONAL_LOGIC = 'conditional_logic';
    case LIVE_PREVIEW = 'live_preview';
    case FILE_UPLOADS = 'file_uploads';
    case PRICE_ADDONS = 'price_addons';
    case INVENTORY_LINKING = 'inventory_linking';
    case FIELD_VALIDATION = 'field_validation';

    /*
    |--------------------------------------------------------------------------
    | UI / Storefront
    |--------------------------------------------------------------------------
    */

    case THEME_APP_EXTENSION = 'theme_app_extension';
    case CUSTOM_STYLING = 'custom_styling';
    case MULTI_LANGUAGE = 'multi_language';

    /*
    |--------------------------------------------------------------------------
    | Management
    |--------------------------------------------------------------------------
    */

    case TEMPLATE_LIBRARY = 'template_library';
    case IMPORT_EXPORT = 'import_export';
    case BULK_EDITOR = 'bulk_editor';

    /*
    |--------------------------------------------------------------------------
    | Support
    |--------------------------------------------------------------------------
    */

    case PRIORITY_SUPPORT = 'priority_support';
    case DEDICATED_ACCOUNT_MANAGER = 'dedicated_account_manager';

    public function label(): string
    {
        return match ($this) {
            self::PRODUCTS_LIMIT => 'Products Limit',
            self::CUSTOM_FIELDS_LIMIT => 'Custom Fields Limit',
            self::STORAGE_LIMIT_MB => 'Storage Limit (MB)',

            self::BASIC_FIELD_TYPES => 'Basic Field Types',
            self::ADVANCED_FIELD_TYPES => 'Advanced Field Types',

            self::CONDITIONAL_LOGIC => 'Conditional Logic',
            self::LIVE_PREVIEW => 'Live Preview',
            self::FILE_UPLOADS => 'File Uploads',
            self::PRICE_ADDONS => 'Price Add-ons',
            self::INVENTORY_LINKING => 'Inventory Linking',
            self::FIELD_VALIDATION => 'Field Validation',

            self::THEME_APP_EXTENSION => 'Theme App Extension',
            self::CUSTOM_STYLING => 'Custom Styling',
            self::MULTI_LANGUAGE => 'Multi-language Support',

            self::TEMPLATE_LIBRARY => 'Template Library',
            self::IMPORT_EXPORT => 'Import / Export',
            self::BULK_EDITOR => 'Bulk Editor',

            self::PRIORITY_SUPPORT => 'Priority Support',
            self::DEDICATED_ACCOUNT_MANAGER => 'Dedicated Account Manager',
        };
    }

    public function config(): array
    {
        return match ($this) {
            self::PRODUCTS_LIMIT => ['type' => 'limit', 'input' => 'number', 'default' => -1, 'group' => 'Limits', 'description' => 'Maximum number of products (-1 for unlimited)'],
            self::CUSTOM_FIELDS_LIMIT => ['type' => 'limit', 'input' => 'number', 'default' => 10, 'group' => 'Limits', 'description' => 'Maximum custom fields allowed per store'],
            self::STORAGE_LIMIT_MB => ['type' => 'limit', 'input' => 'number', 'default' => 100, 'group' => 'Limits', 'description' => 'Storage limit for file uploads in MB'],

            self::BASIC_FIELD_TYPES => ['type' => 'boolean', 'input' => 'toggle', 'default' => true, 'group' => 'Field Types', 'description' => 'Access to basic text, number, and select fields'],
            self::ADVANCED_FIELD_TYPES => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Field Types', 'description' => 'Access to file upload, date picker, and color swatches'],

            self::CONDITIONAL_LOGIC => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Product Customizer Features', 'description' => 'Show/hide fields based on rules'],
            self::LIVE_PREVIEW => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Product Customizer Features', 'description' => 'Live product preview for customers'],
            self::FILE_UPLOADS => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Product Customizer Features', 'description' => 'Allow customers to upload files'],
            self::PRICE_ADDONS => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Product Customizer Features', 'description' => 'Add extra cost to products via fields'],
            self::INVENTORY_LINKING => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Product Customizer Features', 'description' => 'Link options to Shopify inventory'],
            self::FIELD_VALIDATION => ['type' => 'boolean', 'input' => 'toggle', 'default' => true, 'group' => 'Product Customizer Features', 'description' => 'Require fields and set text limits'],

            self::THEME_APP_EXTENSION => ['type' => 'boolean', 'input' => 'toggle', 'default' => true, 'group' => 'UI / Storefront', 'description' => 'Install via Shopify Online Store 2.0 theme blocks'],
            self::CUSTOM_STYLING => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'UI / Storefront', 'description' => 'Inject custom CSS to match store design'],
            self::MULTI_LANGUAGE => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'UI / Storefront', 'description' => 'Support for translating field labels'],

            self::TEMPLATE_LIBRARY => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Management', 'description' => 'Pre-made field templates to start quickly'],
            self::IMPORT_EXPORT => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Management', 'description' => 'Export and import field configurations via CSV/JSON'],
            self::BULK_EDITOR => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Management', 'description' => 'Assign fields to multiple products at once'],

            self::PRIORITY_SUPPORT => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Support', 'description' => 'Skip the queue for support tickets'],
            self::DEDICATED_ACCOUNT_MANAGER => ['type' => 'boolean', 'input' => 'toggle', 'default' => false, 'group' => 'Support', 'description' => '1-on-1 setup and strategy calls'],
        };
    }

    public function isBooleanFeature(): bool
    {
        return $this->config()['type'] === 'boolean';
    }

    public function isLimitFeature(): bool
    {
        return $this->config()['type'] === 'limit';
    }

    public function getDefaultValue(): mixed
    {
        return $this->config()['default'];
    }

    public static function groupedFeatures(): array
    {
        $groups = [];
        foreach (self::cases() as $feature) {
            $config = $feature->config();
            $groupName = $config['group'];

            if (!isset($groups[$groupName])) {
                $groups[$groupName] = [];
            }

            $groups[$groupName][] = [
                'key' => $feature->value,
                'label' => $feature->label(),
                'type' => $config['type'],
                'input' => $config['input'],
                'default' => $config['default'],
                'description' => $config['description'],
            ];
        }

        return $groups;
    }
}