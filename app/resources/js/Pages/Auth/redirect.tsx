import React, { useEffect } from 'react';
import { Text, Page, Spinner, BlockStack } from '@shopify/polaris';

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
        <Page>
            <BlockStack inlineAlign="center">
                <Spinner size="large" />
                <Text as="p" variant="bodyMd">
                    Connecting to Shopify...
                </Text>
            </BlockStack>
        </Page>
    );
}
