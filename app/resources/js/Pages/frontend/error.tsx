import React from 'react';
import { Text, Page, BlockStack, Card, Button } from '@shopify/polaris';

export default function ErrorPage({ message }: { message?: string }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f6f6f7',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <Card>
                <BlockStack gap="400" inlineAlign="center">
                    <Text as="h2" variant="headingLg" tone="critical">
                        Authentication Error
                    </Text>
                    <Text as="p" variant="bodyMd">
                        {message || 'An unexpected error occurred while loading the application.'}
                    </Text>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </BlockStack>
            </Card>
        </div>
    );
}

ErrorPage.layout = null;
