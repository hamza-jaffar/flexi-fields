import React from 'react';
import { AppProvider, Frame } from '@shopify/polaris';
import { NavMenu } from '@shopify/app-bridge-react';
import enTranslations from '@shopify/polaris/locales/en.json';
import { Link } from '@inertiajs/react';
import '@shopify/polaris/build/esm/styles.css';

export default function ShopifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProvider i18n={enTranslations}>
            <NavMenu>
                <Link href="/app">Home</Link>
                <Link href="/app/settings">Settings</Link>
            </NavMenu>
            <Frame>{children}</Frame>
        </AppProvider>
    );
}
