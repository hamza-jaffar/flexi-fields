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
    Grid,
} from '@shopify/polaris';
import {
    StarFilledIcon,
    CheckIcon,
    MagicIcon,
    AppsIcon,
} from '@shopify/polaris-icons';
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

    // Filter plans based on interval toggle
    const filteredPlans = plans.filter((p) =>
        isYearly
            ? p.billing_interval === 'EVERY_12_MONTHS'
            : p.billing_interval === 'EVERY_30_DAYS',
    );

    const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

    const handleSelectPlan = (planId: number) => {
        const shop =
            shopify?.shop ||
            new URLSearchParams(window.location.search).get('shop');
        // Change line 70 to this:
        const url = app.billing.subscribe({ plan: planId, shop } as any).url;

        // Use window.open with _top to ensure we break out of the iframe for Shopify payment
        window.open(url, '_top');
    };

    return (
        <ShopifyLayout>
            <Head title="Billing & Plans" />
            <Page title="Billing & Plans">
                <Layout>
                    {/* Header Section */}
                    <Layout.Section>
                        <Box paddingBlockEnd="600">
                            <BlockStack gap="400">
                                <Text
                                    variant="heading2xl"
                                    as="h1"
                                    fontWeight="bold"
                                >
                                    Upgrade your experience
                                </Text>
                                <Text as="p" variant="bodyLg" tone="subdued">
                                    Select the plan that fits your business
                                    needs. All plans include a 7-day free trial.
                                </Text>
                            </BlockStack>
                        </Box>
                    </Layout.Section>

                    {/* Pricing Grid */}
                    <Layout.Section>
                        <Grid>
                            {displayPlans.map((plan) => (
                                <Grid.Cell
                                    key={plan.id}
                                    columnSpan={{
                                        xs: 6,
                                        sm: 6,
                                        md: 3,
                                        lg: 4,
                                        xl: 4,
                                    }}
                                >
                                    <Box minHeight="100%" paddingBlockEnd="400">
                                        <Card padding="500">
                                            <BlockStack gap="500">
                                                <BlockStack gap="200">
                                                    <InlineStack align="space-between">
                                                        <Text
                                                            variant="headingLg"
                                                            as="h3"
                                                            fontWeight="bold"
                                                        >
                                                            {plan.name}
                                                        </Text>
                                                        {plan.is_featured && (
                                                            <Badge tone="success">
                                                                Popular
                                                            </Badge>
                                                        )}
                                                    </InlineStack>
                                                    <Text
                                                        as="p"
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        Perfect for growing
                                                        businesses
                                                    </Text>
                                                </BlockStack>

                                                <InlineStack
                                                    gap="100"
                                                    blockAlign="end"
                                                >
                                                    <Text
                                                        variant="heading3xl"
                                                        as="p"
                                                        fontWeight="bold"
                                                    >
                                                        {parseFloat(
                                                            plan.price,
                                                        ) === 0
                                                            ? 'Free'
                                                            : `$${plan.discounted_price || plan.price}`}
                                                    </Text>
                                                    {parseFloat(plan.price) >
                                                        0 && (
                                                        <Text
                                                            as="p"
                                                            variant="bodyMd"
                                                            tone="subdued"
                                                        >
                                                            /{' '}
                                                            {isYearly
                                                                ? 'year'
                                                                : 'month'}
                                                        </Text>
                                                    )}
                                                </InlineStack>

                                                <Divider />

                                                <BlockStack gap="300">
                                                    {plan.display_features.map(
                                                        (feature, i) => (
                                                            <InlineStack
                                                                key={i}
                                                                gap="200"
                                                                blockAlign="center"
                                                            >
                                                                <Icon
                                                                    source={
                                                                        CheckIcon
                                                                    }
                                                                    tone="success"
                                                                />
                                                                <Text
                                                                    as="p"
                                                                    variant="bodyMd"
                                                                >
                                                                    {feature}
                                                                </Text>
                                                            </InlineStack>
                                                        ),
                                                    )}
                                                </BlockStack>

                                                <Box paddingBlockStart="400">
                                                    {current_shop.subscription
                                                        ?.plan?.id ===
                                                    plan.id ? (
                                                        <Button
                                                            fullWidth
                                                            disabled
                                                            size="large"
                                                        >
                                                            Current Plan
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            fullWidth
                                                            variant={
                                                                plan.is_featured
                                                                    ? 'primary'
                                                                    : 'secondary'
                                                            }
                                                            size="large"
                                                            onClick={() =>
                                                                handleSelectPlan(
                                                                    plan.id,
                                                                )
                                                            }
                                                        >
                                                            Select Plan
                                                        </Button>
                                                    )}
                                                </Box>
                                            </BlockStack>
                                        </Card>
                                    </Box>
                                </Grid.Cell>
                            ))}

                            {/* Custom Card */}
                            <Grid.Cell
                                columnSpan={{
                                    xs: 6,
                                    sm: 6,
                                    md: 3,
                                    lg: 4,
                                    xl: 4,
                                }}
                            >
                                <Box minHeight="100%" paddingBlockEnd="400">
                                    <Card
                                        padding="500"
                                        background="bg-surface-secondary"
                                    >
                                        <BlockStack gap="500">
                                            <BlockStack gap="200">
                                                <Text
                                                    variant="headingLg"
                                                    as="h3"
                                                    fontWeight="bold"
                                                >
                                                    Custom
                                                </Text>
                                                <Text
                                                    as="p"
                                                    variant="bodySm"
                                                    tone="subdued"
                                                >
                                                    For large enterprise needs
                                                </Text>
                                            </BlockStack>

                                            <Text
                                                variant="heading3xl"
                                                as="p"
                                                fontWeight="bold"
                                            >
                                                Enterprise
                                            </Text>

                                            <Divider />

                                            <BlockStack gap="300">
                                                <InlineStack
                                                    gap="200"
                                                    blockAlign="center"
                                                >
                                                    <Icon
                                                        source={CheckIcon}
                                                        tone="info"
                                                    />
                                                    <Text
                                                        as="p"
                                                        variant="bodyMd"
                                                    >
                                                        Custom metafield limits
                                                    </Text>
                                                </InlineStack>
                                                <InlineStack
                                                    gap="200"
                                                    blockAlign="center"
                                                >
                                                    <Icon
                                                        source={CheckIcon}
                                                        tone="info"
                                                    />
                                                    <Text
                                                        as="p"
                                                        variant="bodyMd"
                                                    >
                                                        SLA & Priority Support
                                                    </Text>
                                                </InlineStack>
                                                <InlineStack
                                                    gap="200"
                                                    blockAlign="center"
                                                >
                                                    <Icon
                                                        source={CheckIcon}
                                                        tone="info"
                                                    />
                                                    <Text
                                                        as="p"
                                                        variant="bodyMd"
                                                    >
                                                        Dedicated Manager
                                                    </Text>
                                                </InlineStack>
                                            </BlockStack>

                                            <Box paddingBlockStart="400">
                                                <Button fullWidth size="large">
                                                    Contact Sales
                                                </Button>
                                            </Box>
                                        </BlockStack>
                                    </Card>
                                </Box>
                            </Grid.Cell>
                        </Grid>
                    </Layout.Section>

                    {/* Stats Footer Section */}
                    <Layout.Section variant="oneHalf">
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    Account Credits
                                </Text>
                                <InlineStack gap="400" blockAlign="center">
                                    <Icon
                                        source={StarFilledIcon}
                                        tone="warning"
                                    />
                                    <Text variant="heading2xl" as="p">
                                        {current_shop.credits.toLocaleString()}
                                    </Text>
                                </InlineStack>
                                <Button variant="plain">
                                    Buy more credits
                                </Button>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    <Layout.Section variant="oneHalf">
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    Active Subscription
                                </Text>
                                <InlineStack gap="400" blockAlign="center">
                                    <Icon source={MagicIcon} tone="info" />
                                    <Text variant="heading2xl" as="p">
                                        {current_shop.subscription?.plan
                                            ?.name || 'Standard'}
                                    </Text>
                                </InlineStack>
                                <Button variant="plain" disabled>
                                    Manage subscription
                                </Button>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </ShopifyLayout>
    );
};

export default Billing;
