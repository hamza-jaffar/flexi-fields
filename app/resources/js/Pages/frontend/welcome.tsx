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
    ProgressBar,
    Badge,
    InlineGrid,
    List,
} from '@shopify/polaris';
import {
    PlusIcon,
    SettingsIcon,
    AppsIcon,
    ViewIcon,
    CheckCircleIcon,
    QuestionCircleIcon,
    CreditCardIcon,
} from '@shopify/polaris-icons';
import { Head, Link } from '@inertiajs/react';
import app from '@/routes/app';

interface Props {
    shop: any;
    stats: {
        limit: number;
        current: number;
        active: number;
    };
    recentFields: any[];
}

const Welcome = ({ shop, stats, recentFields }: Props) => {
    const usagePercentage =
        stats.limit === -1 ? 0 : (stats.current / stats.limit) * 100;
    const planName = shop.subscription?.plan?.name || 'Free';

    return (
        <ShopifyLayout>
            <Head title="Dashboard" />
            <Page fullWidth>
                <BlockStack gap="600">
                    {/* Hero Header */}
                    <Box paddingBlockEnd="400">
                        <InlineStack align="space-between" blockAlign="center">
                            <BlockStack gap="100">
                                <Text
                                    variant="heading2xl"
                                    as="h1"
                                    fontWeight="bold"
                                >
                                    Welcome back, {shop.name}
                                </Text>
                                <Text variant="bodyMd" tone="subdued" as="p">
                                    Manage your custom fields and power up your
                                    store.
                                </Text>
                            </BlockStack>
                            <Link
                                href={app.customField.create()}
                                data={{ shop: shop.shop_domain }}
                            >
                                <Button variant="primary" icon={PlusIcon}>
                                    Create New Field
                                </Button>
                            </Link>
                        </InlineStack>
                    </Box>

                    {/* Stats Grid */}
                    <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap="400">
                        <Card>
                            <BlockStack gap="400">
                                <InlineStack gap="200" blockAlign="center">
                                    <Box background="bg-surface-secondary" padding="100" borderRadius="150">
                                        <Icon source={AppsIcon} tone="subdued" />
                                    </Box>
                                    <Text variant="headingMd" as="h3">
                                        Usage
                                    </Text>
                                </InlineStack>
                                <BlockStack gap="200">
                                    <InlineStack align="space-between">
                                        <Text
                                            as="p"
                                            variant="bodyMd"
                                            tone="subdued"
                                        >
                                            Fields Created
                                        </Text>
                                        <Text
                                            as="p"
                                            variant="bodyMd"
                                            fontWeight="bold"
                                        >
                                            {stats.current} /{' '}
                                            {stats.limit === -1
                                                ? '∞'
                                                : stats.limit}
                                        </Text>
                                    </InlineStack>
                                    <ProgressBar
                                        progress={usagePercentage}
                                        tone={
                                            usagePercentage > 90
                                                ? 'critical'
                                                : usagePercentage > 70
                                                  ? 'warning'
                                                  : 'success'
                                        }
                                    />
                                </BlockStack>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="400">
                                <InlineStack gap="200" blockAlign="center">
                                    <Box background="bg-surface-success" padding="100" borderRadius="150">
                                        <Icon source={CheckCircleIcon} tone="success" />
                                    </Box>
                                    <Text variant="headingMd" as="h3">
                                        Active Status
                                    </Text>
                                </InlineStack>
                                <BlockStack gap="200">
                                    <Text
                                        variant="heading2xl"
                                        as="p"
                                        fontWeight="bold"
                                    >
                                        {stats.active}
                                    </Text>
                                    <Text
                                        as="p"
                                        variant="bodyMd"
                                        tone="subdued"
                                    >
                                        Currently active on storefront
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="400">
                                <InlineStack gap="200" blockAlign="center">
                                    <Box background="bg-surface-secondary" padding="100" borderRadius="150">
                                        <Icon source={CreditCardIcon} tone="subdued" />
                                    </Box>
                                    <Text variant="headingMd" as="h3">
                                        Current Plan
                                    </Text>
                                </InlineStack>
                                <BlockStack gap="200">
                                    <InlineStack gap="200" blockAlign="center">
                                        <Text
                                            variant="heading2xl"
                                            as="p"
                                            fontWeight="bold"
                                        >
                                            {planName}
                                        </Text>
                                        <Badge tone="info">Active</Badge>
                                    </InlineStack>
                                    <Link
                                        href={app.billing()}
                                        data={{ shop: shop.shop_domain }}
                                    >
                                        <Button variant="plain">
                                            Manage subscription
                                        </Button>
                                    </Link>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </InlineGrid>

                    {/* Main Content Layout */}
                    <Layout>
                        <Layout.Section>
                            <Card padding="0">
                                <Box
                                    padding="400"
                                    borderBlockEndWidth="025"
                                    borderColor="border"
                                >
                                    <InlineStack align="space-between">
                                        <Text variant="headingMd" as="h3">
                                            Recent Fields
                                        </Text>
                                        <Link
                                            href={app.customField.index()}
                                            data={{ shop: shop.shop_domain }}
                                        >
                                            <Button variant="plain">
                                                View all
                                            </Button>
                                        </Link>
                                    </InlineStack>
                                </Box>
                                <Box padding="0">
                                    {recentFields.length > 0 ? (
                                        <div className="recent-fields-list">
                                            {recentFields.map((field) => (
                                                <Box
                                                    key={field.id}
                                                    padding="400"
                                                    borderBlockEndWidth="025"
                                                    borderColor="border"
                                                >
                                                    <InlineStack
                                                        align="space-between"
                                                        blockAlign="center"
                                                    >
                                                        <BlockStack gap="050">
                                                            <Text
                                                                as="p"
                                                                variant="bodyMd"
                                                                fontWeight="bold"
                                                            >
                                                                {field.name}
                                                            </Text>
                                                            <InlineStack gap="200">
                                                                <Badge size="small">
                                                                    {field.type}
                                                                </Badge>
                                                                <Text
                                                                    as="p"
                                                                    variant="bodySm"
                                                                    tone="subdued"
                                                                >
                                                                    Target:{' '}
                                                                    {
                                                                        field.target
                                                                    }
                                                                </Text>
                                                            </InlineStack>
                                                        </BlockStack>
                                                        <Link
                                                            href={app.customField.edit(
                                                                field.id,
                                                            )}
                                                            data={{
                                                                shop: shop.shop_domain,
                                                            }}
                                                        >
                                                            <Button
                                                                icon={ViewIcon}
                                                                variant="tertiary"
                                                            >
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    </InlineStack>
                                                </Box>
                                            ))}
                                        </div>
                                    ) : (
                                        <Box padding="800">
                                            <BlockStack
                                                gap="400"
                                                inlineAlign="center"
                                            >
                                                <Icon
                                                    source={AppsIcon}
                                                    tone="subdued"
                                                />
                                                <Text
                                                    as="p"
                                                    variant="bodyMd"
                                                    tone="subdued"
                                                    alignment="center"
                                                >
                                                    No custom fields created
                                                    yet.
                                                </Text>
                                                <Link
                                                    href={app.customField.create()}
                                                    data={{
                                                        shop: shop.shop_domain,
                                                    }}
                                                >
                                                    <Button variant="primary">
                                                        Create your first field
                                                    </Button>
                                                </Link>
                                            </BlockStack>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        </Layout.Section>

                        <Layout.Section variant="oneThird">
                            <BlockStack gap="400">
                                {/* <Card>
                                    <BlockStack gap="400">
                                        <Text variant="headingMd" as="h3">
                                            Quick Help
                                        </Text>
                                        <BlockStack gap="200">
                                            <Button
                                                variant="plain"
                                                textAlign="left"
                                                fullWidth
                                                icon={QuestionCircleIcon}
                                            >
                                                Documentation
                                            </Button>
                                            <Button
                                                variant="plain"
                                                textAlign="left"
                                                fullWidth
                                                icon={QuestionCircleIcon}
                                            >
                                                Video Tutorials
                                            </Button>
                                            <Button
                                                variant="plain"
                                                textAlign="left"
                                                fullWidth
                                                icon={QuestionCircleIcon}
                                            >
                                                Contact Support
                                            </Button>
                                        </BlockStack>
                                    </BlockStack>
                                </Card> */}

                                <Box
                                    padding="400"
                                    background="bg-surface-secondary"
                                    borderRadius="200"
                                >
                                    <BlockStack gap="200">
                                        <Text variant="headingSm" as="h4">
                                            Pro Tip
                                        </Text>
                                        <Text
                                            as="p"
                                            variant="bodySm"
                                            tone="subdued"
                                        >
                                            Use "Conditional Logic" to show
                                            fields only when specific options
                                            are selected by the customer.
                                        </Text>
                                    </BlockStack>
                                </Box>
                            </BlockStack>
                        </Layout.Section>
                    </Layout>
                </BlockStack>
            </Page>
        </ShopifyLayout>
    );
};

export default Welcome;
