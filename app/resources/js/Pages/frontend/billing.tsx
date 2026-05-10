import ShopifyLayout from '@/layouts/shopify-layout';
import {
    Page,
    Layout,
    Card,
    Text,
    BlockStack,
    InlineStack,
    Button,
    Badge,
    Box,
    Icon,
    Divider,
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

    const handleSelectPlan = (planId: number) => {
        const shop = shopify?.shop || new URLSearchParams(window.location.search).get('shop');
        const url = app.billing.subscribe({ plan: planId, shop } as any).url;
        window.open(url, '_top');
    };

    // Features to compare
    const comparisonFeatures = [
        { label: 'Custom Fields', keys: ['custom_fields_limit'] },
        { label: 'Standard Field Types', keys: ['standard_field_types'] },
        { label: 'Advanced Field Types', keys: ['advanced_field_types'] },
        { label: 'Theme App Extension', keys: ['theme_extension'] },
        { label: 'Conditional Logic', keys: ['conditional_logic'] },
        { label: 'Price Add-ons', keys: ['price_addons'] },
        { label: 'Bulk Editor Tools', keys: ['bulk_editor'] },
        { label: 'File Uploads', keys: ['file_uploads'] },
        { label: 'Priority Support', keys: ['priority_support'] },
        { label: 'Account Manager', keys: ['account_manager'] },
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
                    <Box paddingBlockStart="800" paddingBlockEnd="400">
                        <BlockStack gap="400" inlineAlign="center">
                            <Text variant="heading3xl" as="h1" fontWeight="bold" alignment="center">
                                Choose the plan that's right for you
                            </Text>
                            <Text as="p" variant="bodyLg" tone="subdued" alignment="center">
                                All paid plans include a 7-day free trial. Scale as you grow.
                            </Text>

                            {hasYearlyPlans && (
                                <Box paddingBlockStart="200">
                                    <ButtonGroup variant="segmented">
                                        <Button pressed={!isYearly} onClick={() => setIsYearly(false)}>Monthly</Button>
                                        <Button pressed={isYearly} onClick={() => setIsYearly(true)}>Yearly (20% Off)</Button>
                                    </ButtonGroup>
                                </Box>
                            )}
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
                                                    <Text variant="headingMd" as="h3">Compare Plans</Text>
                                                </th>
                                                {displayPlans.map((plan) => (
                                                    <th key={plan.id} style={{ padding: '24px', textAlign: 'center', minWidth: '150px', background: plan.handle === 'pro' ? '#f8f9ff' : 'transparent' }}>
                                                        <BlockStack gap="200">
                                                            <Text variant="headingMd" as="h4" fontWeight="bold">{plan.name}</Text>
                                                            <Text variant="headingLg" as="p" fontWeight="bold">
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
                                                        <Text variant="bodyMd" fontWeight="medium">{feature.label}</Text>
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
                                                                    <Text variant="bodyMd" fontWeight="bold">{val === -1 ? 'Unlimited' : val}</Text>
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
                                <Text variant="bodySm" tone="subdued">Cancel anytime</Text>
                            </BlockStack>
                            <BlockStack gap="100" inlineAlign="center">
                                <Icon source={CheckIcon} tone="success" />
                                <Text variant="bodySm" tone="subdued">7-day free trial</Text>
                            </BlockStack>
                            <BlockStack gap="100" inlineAlign="center">
                                <Icon source={CheckIcon} tone="success" />
                                <Text variant="bodySm" tone="subdued">No hidden fees</Text>
                            </BlockStack>
                        </InlineStack>
                    </Box>
                </BlockStack>
            </Page>
        </ShopifyLayout>
    );
};

export default Billing;
