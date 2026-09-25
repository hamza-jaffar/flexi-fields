import ShopifyLayout from '@/layouts/shopify-layout';
import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    InlineStack,
    Button,
    Box,
    Icon,
    ButtonGroup,
} from '@shopify/polaris';
import { CheckIcon, StarFilledIcon, MinusIcon } from '@shopify/polaris-icons';
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import app from '@/routes/app';

interface Plan {
    id: number;
    name: string;
    handle: string;
    price: string;
    discounted_price: string | null;
    currency: string;
    billing_interval: string;
    trial_days: number;
    is_featured: boolean;
    display_features: string[];
    internal_features: any;
}

interface CurrentShop {
    name: string;
    credits: number;
    subscription: {
        id: number;
        status: string;
        plan: Plan;
    } | null;
}

interface Props {
    plans: Plan[];
    current_shop: CurrentShop;
}

const Billing = ({ plans, current_shop }: Props) => {
    const { shopify } = usePage().props as any;
    const [isYearly, setIsYearly] = useState(false);

    const hasYearlyPlans = plans.some(
        (p) => p.billing_interval === 'EVERY_12_MONTHS',
    );

    const displayPlans = plans.filter((p) =>
        isYearly
            ? p.billing_interval === 'EVERY_12_MONTHS'
            : p.billing_interval === 'EVERY_30_DAYS',
    ).length > 0 
        ? plans.filter((p) => isYearly ? p.billing_interval === 'EVERY_12_MONTHS' : p.billing_interval === 'EVERY_30_DAYS')
        : plans;

const handleSelectPlan = async (planId: number) => {
    // 1. Fallback stack: Try App Bridge config, then current URL, then global window layout variables
    const shop = window.shopify?.config?.shop 
        || new URLSearchParams(window.location.search).get('shop') 
        || (window as any).shopDomain;

    if (!shop) {
        alert("Error: Could not detect your Shopify shop domain. Please refresh the page.");
        return;
    }

    // 2. Generate the base subscription URL from your helper
    let url = app.billing.subscribe({ plan: planId } as any).url;

    // 3. Explicitly attach the shop parameter to the end of the redirect string
    if (url.includes('?')) {
        url = `${url}&shop=${shop}`;
    } else {
        url = `${url}?shop=${shop}`;
    }

    // 4. Redirect the top-level parent window out of the iframe
    if (window.top) {
        window.top.location.href = url;
    } else {
        window.open(url, '_top');
    }
};

    // Features to compare
    const comparisonFeatures = [
        { label: 'Custom Fields', keys: ['custom_fields_limit'] },
        { label: 'Storage Limit', keys: ['storage_limit_mb'] },
        { label: 'Standard Field Types', keys: ['basic_field_types'] },
        { label: 'Advanced Field Types', keys: ['advanced_field_types'] },
        { label: 'Conditional Logic', keys: ['conditional_logic'] },
        { label: 'Price Add-ons', keys: ['price_addons'] },
        { label: 'Bulk Editor Tools', keys: ['bulk_editor'] },
        { label: 'File Uploads', keys: ['file_uploads'] },
        { label: 'Priority Support', keys: ['priority_support'] },
    ];

    const getFeatureValue = (plan: Plan, featureKey: string) => {
        const feature = plan.internal_features.find((f: any) => f.feature_key === featureKey);
        if (!feature) return false;
        return feature.feature_value;
    };

    return (
        <ShopifyLayout>
            <Head title="Choose Your Plan" />
            <Page fullWidth>
                <BlockStack gap="800">
                    {/* Header */}
                    <Box paddingBlockStart="600" paddingBlockEnd="400">
                        <BlockStack gap="400" inlineAlign="center">
                            <Text variant="heading2xl" as="h1" fontWeight="medium" alignment="center">
                                Choose the plan that's right for you
                            </Text>
                            <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
                                All paid plans include a 7-day free trial. Scale as you grow.
                            </Text>
                        </BlockStack>
                    </Box>

                    {/* Comparison Table */}
                    <Layout>
                        <Layout.Section>
                            <Card padding="0">
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="pricing-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '24px', textAlign: 'left', minWidth: '200px' }}>
                                                    <Text variant="headingMd" as="h4">Compare Plans</Text>
                                                </th>
                                                {displayPlans.map((plan) => (
                                                    <th key={plan.id} style={{ padding: '24px', textAlign: 'center', minWidth: '150px', background: plan.handle === 'pro' ? '#f8f9ff' : 'transparent' }}>
                                                        <BlockStack gap="200">
                                                            <Text variant="headingMd" as="h6" fontWeight="semibold">{plan.name}</Text>
                                                            <Text variant="headingLg" as="p" fontWeight="medium">
                                                                {parseFloat(plan.price) === 0 ? 'Free' : `$${plan.price}`}
                                                            </Text>
                                                            <div style={{ marginTop: '12px' }}>
                                                                {current_shop.subscription?.plan?.id === plan.id ? (
                                                                    <Button fullWidth disabled>Active</Button>
                                                                ) : (
                                                                    <Button 
                                                                        fullWidth 
                                                                        variant={plan.handle === 'pro' ? 'primary' : 'secondary'}
                                                                        onClick={() => handleSelectPlan(plan.id)}
                                                                    >
                                                                        {parseFloat(plan.price) === 0 ? 'Choose' : 'Select'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </BlockStack>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonFeatures.map((feature, idx) => (
                                                <tr key={idx} style={{ borderTop: '1px solid #edeeef' }}>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <Text as='p' variant="bodyMd" fontWeight="medium">{feature.label}</Text>
                                                    </td>
                                                    {displayPlans.map((plan) => {
                                                        const val = getFeatureValue(plan, feature.keys[0]);
                                                        return (
                                                            <td key={plan.id} style={{ padding: '16px 24px', textAlign: 'center', background: plan.handle === 'pro' ? '#f8f9ff' : 'transparent' }}>
                                                                {typeof val === 'boolean' ? (
                                                                    val ? (
                                                                        <Icon source={CheckIcon} tone="success" />
                                                                    ) : (
                                                                        <Icon source={MinusIcon} tone="subdued" />
                                                                    )
                                                                ) : (
                                                                    <Text as='p' variant="bodyMd" fontWeight="medium">
                                                                        {val === -1 ? 'Unlimited' : 
                                                                         feature.keys.includes('storage_limit_mb') ? 
                                                                         (val >= 1000 ? `${val/1000}GB` : `${val}MB`) : 
                                                                         val}
                                                                    </Text>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>

                    {/* Footer Signals */}
                    <Box paddingBlockEnd="800">
                        <InlineStack gap="600" align="center">
                            <BlockStack gap="100" inlineAlign="center">
                                <Icon source={CheckIcon} tone="success" />
                                <Text as='p' variant="bodySm" tone="subdued">Cancel anytime</Text>
                            </BlockStack>
                            <BlockStack gap="100" inlineAlign="center">
                                <Icon source={CheckIcon} tone="success" />
                                <Text as='p' variant="bodySm" tone="subdued">7-day free trial</Text>
                            </BlockStack>
                            <BlockStack gap="100" inlineAlign="center">
                                <Icon source={CheckIcon} tone="success" />
                                <Text as='p' variant="bodySm" tone="subdued">No hidden fees</Text>
                            </BlockStack>
                        </InlineStack>
                    </Box>
                </BlockStack>
            </Page>
        </ShopifyLayout>
    );
};

export default Billing;
