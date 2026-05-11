import React, { useState, useCallback } from 'react';
import {
    Page,
    Layout,
    Card,
    FormLayout,
    TextField,
    Button,
    BlockStack,
    Text,
    InlineStack,
    Banner,
    Box,
} from '@shopify/polaris';
import { useForm, usePage } from '@inertiajs/react';
import ShopifyLayout from '@/layouts/shopify-layout';
import app from '@/routes/app';

interface SettingsProps {
    settings: {
        summary_label: string;
        required_error_label: string;
        addon_product_name: string;
    };
}

export default function SettingsPage({ settings }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        summary_label: settings.summary_label || 'Price add-ons',
        required_error_label: settings.required_error_label || 'is required',
        addon_product_name: settings.addon_product_name || 'Flexi Fields Addon',
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const { flash } = usePage().props as any;

    const handleSubmit = useCallback(() => {
        post(app.settings.update.url(), {
            onSuccess: () => setShowSuccess(true),
        });
    }, [data, post]);

    return (
        <ShopifyLayout>
            <Page
                title="Settings"
                subtitle="Customize how Flexi Fields appears on your storefront"
                backAction={{ content: 'Dashboard', url: app.index.url() }}
            >
                <Layout>
                    <Layout.Section>
                        <BlockStack gap="400">
                            {showSuccess && flash?.success && (
                                <Banner
                                    title={flash.success}
                                    tone="success"
                                    onDismiss={() => setShowSuccess(false)}
                                />
                            )}
                            <Card>
                                <FormLayout>
                                    <BlockStack gap="400">
                                        <Text as="h2" variant="headingMd">
                                            Storefront Labels
                                        </Text>
                                        <TextField
                                            label="Price Summary Label"
                                            value={data.summary_label}
                                            onChange={(val) =>
                                                setData('summary_label', val)
                                            }
                                            helpText="The title shown in the green price bar (e.g., 'Extra Options')"
                                            error={errors.summary_label}
                                            autoComplete="off"
                                        />
                                        <TextField
                                            label="Required Field Error"
                                            value={data.required_error_label}
                                            onChange={(val) =>
                                                setData(
                                                    'required_error_label',
                                                    val,
                                                )
                                            }
                                            helpText="The error message shown when a field is empty (e.g., 'is required')"
                                            error={errors.required_error_label}
                                            autoComplete="off"
                                        />
                                    </BlockStack>

                                    <BlockStack gap="400">
                                        <Text as="h2" variant="headingMd">
                                            Advanced Configuration
                                        </Text>
                                        <TextField
                                            label="Addon Product Name"
                                            value={data.addon_product_name}
                                            onChange={(val) =>
                                                setData(
                                                    'addon_product_name',
                                                    val,
                                                )
                                            }
                                            helpText="The internal name used for the hidden price addon product"
                                            error={errors.addon_product_name}
                                            autoComplete="off"
                                        />
                                    </BlockStack>

                                    <Box paddingBlockStart="600">
                                        <InlineStack align="end">
                                            <Button
                                                variant="primary"
                                                onClick={handleSubmit}
                                                loading={processing}
                                            >
                                                Save Settings
                                            </Button>
                                        </InlineStack>
                                    </Box>
                                </FormLayout>
                            </Card>
                        </BlockStack>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="200">
                                <Text as="h2" variant="headingMd">
                                    Why customize?
                                </Text>
                                <Text as="p" tone="subdued">
                                    Flexi Fields allows you to translate or
                                    brand the app to match your store's theme.
                                </Text>
                                <Text as="p" tone="subdued">
                                    Changes made here apply instantly to your
                                    storefront product pages.
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </ShopifyLayout>
    );
}
