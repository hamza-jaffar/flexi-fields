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
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f6f6f7',
            gap: '16px'
        }}>
            <Spinner size="large" />
            <Text as="p" variant="bodyLg" tone="subdued">
                Connecting to Shopify...
            </Text>
        </div>
    );
}

RedirectPage.layout = null;
