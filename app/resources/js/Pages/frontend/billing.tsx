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
    ButtonGroup,
} from '@shopify/polaris';
import { CheckIcon, StarFilledIcon, MagicIcon } from '@shopify/polaris-icons';
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

    // Determine if we have any yearly plans to show the toggle
    const hasYearlyPlans = plans.some(
        (p) => p.billing_interval === 'EVERY_12_MONTHS',
    );
    const [isYearly, setIsYearly] = useState(false);

    // Filter plans based on interval toggle
    const filteredPlans = plans.filter((p) =>
        isYearly
            ? p.billing_interval === 'EVERY_12_MONTHS'
            : p.billing_interval === 'EVERY_30_DAYS',
    );

    // If no plans for the selected interval, just show the ones we have
    const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

    const handleSelectPlan = (planId: number) => {
        const shop =
            shopify?.shop ||
            new URLSearchParams(window.location.search).get('shop');
        const url = app.billing.subscribe({ plan: planId, shop } as any).url;
        window.open(url, '_top');
    };

    return (
        <ShopifyLayout>
            <Head title="Choose your plan" />
            <Page>
                <Layout>
                    <Layout.Section>
                        <Box paddingBlockEnd="800" paddingBlockStart="400">
                            <BlockStack gap="400" inlineAlign="center">
                                <Text
                                    variant="heading3xl"
                                    as="h1"
                                    fontWeight="bold"
                                    alignment="center"
                                >
                                    Choose the right plan for your store
                                </Text>
                                <Text
                                    as="p"
                                    variant="bodyLg"
                                    tone="subdued"
                                    alignment="center"
                                >
                                    Unlock advanced features and scale your
                                    business. All paid plans include a 7-day
                                    free trial.
                                </Text>

                                {hasYearlyPlans && (
                                    <Box paddingBlockStart="400">
                                        <ButtonGroup variant="segmented">
                                            <Button
                                                pressed={!isYearly}
                                                onClick={() =>
                                                    setIsYearly(false)
                                                }
                                            >
                                                Monthly billing
                                            </Button>
                                            <Button
                                                pressed={isYearly}
                                                onClick={() =>
                                                    setIsYearly(true)
                                                }
                                            >
                                                Yearly billing
                                                {/* <Badge tone="success">
                                                    Save 20%
                                                </Badge> */}
                                            </Button>
                                        </ButtonGroup>
                                    </Box>
                                )}
                            </BlockStack>
                        </Box>
                    </Layout.Section>

                    <Layout.Section>
                        <Grid>
                            {displayPlans.map((plan) => {
                                const isCurrentPlan =
                                    current_shop.subscription?.plan?.id ===
                                    plan.id;

                                return (
                                    <Grid.Cell
                                        key={plan.id}
                                        columnSpan={{
                                            xs: 6,
                                            sm: 6,
                                            md: 4,
                                            lg: 4,
                                            xl: 4,
                                        }}
                                    >
                                        <Box
                                            minHeight="100%"
                                            paddingBlockEnd="400"
                                        >
                                            <Card
                                                background={
                                                    plan.is_featured
                                                        ? 'bg-surface-secondary'
                                                        : 'bg-surface'
                                                }
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        height: '100%',
                                                        minHeight: '350px',
                                                    }}
                                                >
                                                    <BlockStack gap="100">
                                                        <InlineStack
                                                            align="space-between"
                                                            blockAlign="center"
                                                        >
                                                            <Text
                                                                variant="headingLg"
                                                                as="h3"
                                                                fontWeight="bold"
                                                            >
                                                                {plan.name}
                                                            </Text>
                                                            {plan.is_featured && (
                                                                <Badge tone="magic">
                                                                    Most Popular
                                                                </Badge>
                                                            )}
                                                        </InlineStack>

                                                        <Box paddingBlockEnd="400">
                                                            <InlineStack
                                                                gap="0"
                                                                blockAlign="baseline"
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
                                                                {parseFloat(
                                                                    plan.price,
                                                                ) > 0 ? (
                                                                    <Text
                                                                        as="span"
                                                                        variant="bodyMd"
                                                                        tone="subdued"
                                                                    >
                                                                        /
                                                                        {isYearly
                                                                            ? 'year'
                                                                            : 'month'}
                                                                    </Text>
                                                                ) : (
                                                                    <Text
                                                                        as="span"
                                                                        variant="bodyMd"
                                                                        tone="subdued"
                                                                    >
                                                                        /
                                                                    </Text>
                                                                )}
                                                            </InlineStack>
                                                        </Box>

                                                        <BlockStack gap="200">
                                                            {plan.display_features.map(
                                                                (
                                                                    feature,
                                                                    i,
                                                                ) => (
                                                                    <Text
                                                                        key={i}
                                                                        as="p"
                                                                        variant="bodyMd"
                                                                        tone="subdued"
                                                                    >
                                                                        {
                                                                            feature
                                                                        }
                                                                    </Text>
                                                                ),
                                                            )}
                                                        </BlockStack>
                                                    </BlockStack>

                                                    <div
                                                        style={{ flexGrow: 1 }}
                                                    />

                                                    <Box paddingBlockStart="600">
                                                        {isCurrentPlan ? (
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
                                                                variant="primary"
                                                                tone={
                                                                    plan.is_featured
                                                                        ? 'success'
                                                                        : undefined
                                                                }
                                                                size="large"
                                                                onClick={() =>
                                                                    handleSelectPlan(
                                                                        plan.id,
                                                                    )
                                                                }
                                                            >
                                                                {parseFloat(
                                                                    plan.price,
                                                                ) === 0
                                                                    ? 'Get started'
                                                                    : 'Start free trial'}
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </div>
                                            </Card>
                                        </Box>
                                    </Grid.Cell>
                                );
                            })}
                        </Grid>
                    </Layout.Section>
                </Layout>
            </Page>
        </ShopifyLayout>
    );
};

export default Billing;
