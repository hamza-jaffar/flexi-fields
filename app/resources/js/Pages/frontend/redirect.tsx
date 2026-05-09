import React, { useEffect } from 'react';
import { Text, Page, Spinner, BlockStack } from '@shopify/polaris';
import ShopifyLayout from '@/layouts/shopify-layout';

export default function RedirectPage({ authUrl }: { authUrl: string }) {
    useEffect(() => {
        if (authUrl) {
            // Robust Frame-Busting:
            // This works in all App Bridge versions and even if App Bridge fails to init.
            if (window.top) {
                window.top.location.href = authUrl;
            } else {
                window.location.href = authUrl;
            }
        }
    }, [authUrl]);

    return (
        <ShopifyLayout>
            <Page>
                <BlockStack inlineAlign="center">
                    <Spinner size="small" />
                    <Text as="p" variant="bodyMd">
                        Connecting to Shopify...
                    </Text>
                </BlockStack>
            </Page>
        </ShopifyLayout>
    );
}

RedirectPage.layout = null;
